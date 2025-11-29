import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskService } from '../services/task.service';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Comment {
  _id?: string;
  text: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: Date;
}

interface GroupMember {
  _id: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
})
export class TaskComponent implements OnInit {
  @Input() task!: Task;
  @Output() taskDeleted = new EventEmitter<number>();
  @Output() taskUpdated = new EventEmitter<Task>();

  // Edit mode state
  isEditing = false;
  editTitle = '';
  editDescription = '';
  editPriority: 'Low' | 'Medium' | 'High' = 'Low';
  editDueDate = '';
  editAssignedTo = '';

  // Comment functionality
  comments: Comment[] = [];
  newComment = '';
  showComments = false;
  lastViewedCommentCount = 0; // Track number of comments when last viewed

  // Group members for assignment
  groupMembers: GroupMember[] = [];
  isGroupLeader = false;

  // Expand/Collapse state
  isExpanded = false;

  // View details modal
  showDetailsModal = false;

  private apiUrl = environment.apiUrl;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.isGroupLeader = this.authService.isGroupLeader();

    // Load last viewed comment count from localStorage
    this.loadLastViewedCommentCount();

    console.log('📋 Task Component Init:', {
      taskTitle: this.task.title,
      taskId: this.task.id,
      taskAssignedTo: this.task.assignedTo,
      taskAssignedToName: this.task.assignedToName,
      taskAssignedToEmail: this.task.assignedToEmail,
      taskDueDate: this.task.dueDate,
      currentUserId: user?.id,
      currentUserName: user?.name,
      currentUserRole: user?.role,
      currentUserEmail: user?.email,
      'MATCH?': this.task.assignedTo === user?.id,
      lastViewedCommentCount: this.lastViewedCommentCount,
      FULL_TASK_OBJECT: this.task,
    });

    this.loadComments();
    if (this.isGroupLeader) {
      this.loadGroupMembers();
    }
  }

  // Check if user can edit/delete this task
  canModifyTask(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // Only single users and group leaders can modify tasks
    // Members can NEVER edit/delete tasks (only comment on assigned ones)
    if (user.userType === 'single' || user.role === 'leader') {
      return true;
    }

    // Members cannot modify tasks at all
    return false;
  }

  // Check if user can comment on this task
  canComment(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.log('❌ canComment: No user logged in');
      return false;
    }

    console.log('🔍 canComment check:', {
      taskTitle: this.task.title,
      userRole: user.role,
      userType: user.userType,
      userId: user.id,
      taskAssignedTo: this.task.assignedTo,
      taskAssignedToName: this.task.assignedToName,
      areEqual: this.task.assignedTo === user.id,
      userIdType: typeof user.id,
      assignedToType: typeof this.task.assignedTo,
    });

    // Leaders and single users can comment on all tasks
    if (user.userType === 'single' || user.role === 'leader') {
      console.log('✅ canComment: TRUE (leader/single user)');
      return true;
    }

    // Members can ONLY comment on tasks assigned to them
    if (user.role === 'member') {
      const isAssigned = !!(
        this.task.assignedTo &&
        (this.task.assignedTo === user.id ||
          this.task.assignedTo.toString() === user.id.toString())
      );
      console.log(
        '🔍 Member comment check:',
        isAssigned ? '✅ TRUE - Task assigned to me' : '❌ FALSE - Not my task'
      );
      return isAssigned;
    }

    console.log('❌ canComment: FALSE (default)');
    return false;
  }

  // Load group members for assignment dropdown
  loadGroupMembers() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.authService.getGroupMembers().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.groupMembers = response.members || [];
        }
      },
      error: (error: any) => {
        console.error('Failed to load group members:', error);
      },
    });
  }

  // Load comments for this task
  loadComments() {
    const ownerInfo = this.taskService.getOwnerInfo();
    if (!ownerInfo) {
      console.error('❌ Cannot load comments: No owner info');
      return;
    }

    const params = `?boardOwnerId=${ownerInfo.ownerId}&boardOwnerType=${ownerInfo.ownerType}`;

    this.http
      .get<any>(`${this.apiUrl}/tasks/${this.task.id}/comments${params}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.comments = response.comments || [];
            console.log('💬 Comments loaded:', this.comments.length);
          }
        },
        error: (error: any) => {
          console.error('Failed to load comments:', error);
        },
      });
  }

  // Check if there are new comments since last viewed
  hasNewComments(): boolean {
    return (
      this.comments.length > 0 &&
      this.comments.length > this.lastViewedCommentCount
    );
  }

  // Load last viewed comment count from localStorage
  loadLastViewedCommentCount() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const key = `task_comments_viewed_${user.id}_${this.task.id}`;
    const stored = localStorage.getItem(key);
    this.lastViewedCommentCount = stored ? parseInt(stored, 10) : 0;
  }

  // Save current comment count as last viewed
  saveLastViewedCommentCount() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const key = `task_comments_viewed_${user.id}_${this.task.id}`;
    localStorage.setItem(key, this.comments.length.toString());
    this.lastViewedCommentCount = this.comments.length;
  }

  // Add comment to task
  addComment() {
    if (!this.newComment.trim()) return;

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const ownerInfo = this.taskService.getOwnerInfo();
    if (!ownerInfo) {
      console.error('❌ Cannot add comment: No owner info');
      return;
    }

    const comment = {
      taskId: this.task.id,
      boardOwnerId: ownerInfo.ownerId,
      boardOwnerType: ownerInfo.ownerType,
      text: this.newComment.trim(),
      authorId: user.id,
      authorName: user.name,
      authorEmail: user.email,
      assignedTo: this.task.assignedTo, // Include assigned user for notifications
    };

    console.log('📝 Adding comment:', {
      taskId: this.task.id,
      boardOwner: `${ownerInfo.ownerType}:${ownerInfo.ownerId}`,
      author: user.name,
    });

    this.http
      .post<any>(`${this.apiUrl}/tasks/${this.task.id}/comments`, comment)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.comments.push(response.comment);
            this.newComment = '';
            console.log('💬 Comment added successfully');
          }
        },
        error: (error: any) => {
          console.error('Failed to add comment:', error);
          alert('Failed to add comment');
        },
      });
  }

  // Toggle comments section
  toggleComments() {
    this.showComments = !this.showComments;
    if (this.showComments) {
      // Save comment count when opened
      this.saveLastViewedCommentCount();
      if (this.comments.length === 0) {
        this.loadComments();
      }
    }
  }

  // Check if comment belongs to current user (for WhatsApp-style layout)
  isMyComment(comment: Comment): boolean {
    const user = this.authService.getCurrentUser();
    return user && comment.authorId === user.id;
  }

  // Mark all comments as viewed by current user
  markCommentsAsViewed() {
    // Removed - no longer needed
  }

  // Start editing mode
  startEdit(): void {
    if (!this.canModifyTask()) {
      console.log('⚠️ You can only edit tasks assigned to you');
      return;
    }
    this.isEditing = true;
    this.editTitle = this.task.title;
    this.editDescription = this.task.description;
    this.editPriority = this.task.priority;
    this.editDueDate = this.task.dueDate
      ? new Date(this.task.dueDate).toISOString().split('T')[0]
      : '';
    this.editAssignedTo = this.task.assignedTo || '';
  }

  // Save changes
  saveEdit(): void {
    if (this.editTitle.trim()) {
      const updates: any = {
        title: this.editTitle.trim(),
        description: this.editDescription.trim(),
        priority: this.editPriority,
      };

      // Leaders can update due date and assignment
      if (this.isGroupLeader) {
        if (this.editDueDate) {
          updates.dueDate = new Date(this.editDueDate);
        }
        if (this.editAssignedTo) {
          const member = this.groupMembers.find(
            (m) => m._id === this.editAssignedTo
          );
          if (member) {
            updates.assignedTo = member._id;
            updates.assignedToName = member.name;
            updates.assignedToEmail = member.email;
          }
        }
      }

      this.taskService.updateTask(this.task.id, updates);
      this.taskUpdated.emit({ ...this.task, ...updates });
      this.isEditing = false;
    }
  }

  // Cancel editing
  cancelEdit(): void {
    this.isEditing = false;
    this.editTitle = this.task.title;
    this.editDescription = this.task.description;
    this.editPriority = this.task.priority;
    this.editDueDate = this.task.dueDate
      ? new Date(this.task.dueDate).toISOString().split('T')[0]
      : '';
    this.editAssignedTo = this.task.assignedTo || '';
  }

  // Delete task
  deleteTask(): void {
    if (!this.canModifyTask()) {
      alert('⚠️ You can only delete tasks assigned to you');
      return;
    }
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(this.task.id);
      this.taskDeleted.emit(this.task.id);
    }
  }

  // Get priority color class
  getPriorityClass(): string {
    switch (this.task.priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return 'priority-low';
    }
  }

  // Toggle expand/collapse
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  // Show task details modal (for view-only tasks)
  showTaskDetails(): void {
    this.showDetailsModal = true;
  }

  // Close task details modal
  closeDetailsModal(): void {
    this.showDetailsModal = false;
  }

  // Format due date
  formatDueDate(): string {
    if (!this.task.dueDate) return 'No due date';
    const dueDate = new Date(this.task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  }

  // Check if title is long (more than 2 lines worth of text)
  isTitleLong(): boolean {
    return this.task.title.length > 50; // Approximate character limit for 2 lines
  }

  // Check if description is long (more than 3 lines worth of text)
  isDescriptionLong(): boolean {
    return !!(this.task.description && this.task.description.length > 120); // Approximate character limit for 3 lines
  }

  // Check if content needs "More" button
  needsMoreButton(): boolean {
    return this.isTitleLong() || this.isDescriptionLong();
  }

  // Handle drag start
  onDragStart(event: DragEvent): void {
    if (event.dataTransfer) {
      // Prevent event from bubbling up to column
      event.stopPropagation();

      // Set the data - this must be done first and is most important
      event.dataTransfer.setData('text/plain', this.task.id.toString());
      event.dataTransfer.effectAllowed = 'move';

      // Add visual feedback
      const element = event.currentTarget as HTMLElement;
      element.classList.add('dragging');

      // Handle drag end to remove visual effects
      const handleDragEnd = () => {
        element.classList.remove('dragging');
        window.removeEventListener('dragend', handleDragEnd);
      };

      window.addEventListener('dragend', handleDragEnd);
    }
  }
}
