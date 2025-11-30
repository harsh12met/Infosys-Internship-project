import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../services/task.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

interface GroupMember {
  _id: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
})
export class AddTaskComponent implements OnInit {
  @Input() columnStatus = 'todo';
  @Output() taskAdded = new EventEmitter<void>();

  isFormVisible = false;
  taskTitle = '';
  taskDescription = '';
  taskPriority: 'Low' | 'Medium' | 'High' = 'Medium';
  taskDueDate = '';
  assignedTo = '';

  isGroupLeader = false;
  groupMembers: GroupMember[] = [];
  filteredMembers: GroupMember[] = [];
  memberSearchQuery = '';
  showMemberDropdown = false;
  dropdownStyle: any = {};

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.isGroupLeader = this.authService.isGroupLeader();
    console.log('AddTask Component - isGroupLeader:', this.isGroupLeader);
    if (this.isGroupLeader) {
      this.loadGroupMembers();
    }
  }

  loadGroupMembers() {
    console.log('🔄 Loading group members...');
    const user = this.authService.getCurrentUser();
    console.log('👤 Current user details:', {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      userType: user?.userType,
      groupId: user?.groupId,
      accessKey: user?.accessKey,
    });

    this.authService.getGroupMembers().subscribe({
      next: (response: any) => {
        console.log('✅ Group members API response:', response);
        if (response.success) {
          this.groupMembers = response.members || [];
          this.filteredMembers = this.groupMembers;
          console.log(
            '📋 Group members loaded:',
            this.groupMembers.length,
            'members'
          );
          console.log('📋 Members list:', this.groupMembers);

          if (this.groupMembers.length === 0) {
            console.warn(
              '⚠️ No group members found. Make sure members have joined with the access key:',
              user?.accessKey
            );
          }
        } else {
          console.error('❌ Failed to load group members:', response.message);
        }
      },
      error: (error) => {
        console.error('❌ Failed to load group members - Error:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error details:', error.error);
      },
    });
  }

  filterMembers() {
    if (!this.memberSearchQuery.trim()) {
      this.filteredMembers = this.groupMembers;
      return;
    }
    const query = this.memberSearchQuery.toLowerCase();
    this.filteredMembers = this.groupMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
    );
    console.log('Filtered members:', this.filteredMembers);
  }

  onFocusAssignment() {
    this.showMemberDropdown = true;
    this.filterMembers(); // Reset to show all members
    
    // Calculate dropdown position
    setTimeout(() => {
      const input = document.querySelector('.member-search-input') as HTMLElement;
      if (input) {
        const rect = input.getBoundingClientRect();
        this.dropdownStyle = {
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`
        };
      }
    }, 0);
    
    console.log(
      'Focus on assignment - showing dropdown, members count:',
      this.filteredMembers.length
    );
  }

  selectMember(member: GroupMember) {
    this.assignedTo = member._id;
    this.memberSearchQuery = member.name;
    this.showMemberDropdown = false;
  }

  clearAssignment() {
    this.assignedTo = '';
    this.memberSearchQuery = '';
  }

  showForm() {
    this.isFormVisible = true;
    setTimeout(
      () =>
        (
          document.querySelector('.add-task-title') as HTMLInputElement
        )?.focus(),
      0
    );
  }

  hideForm() {
    this.isFormVisible = false;
    this.taskTitle = '';
    this.taskDescription = '';
    this.taskPriority = 'Medium';
    this.taskDueDate = '';
    this.assignedTo = '';
    this.memberSearchQuery = '';
  }

  submitTask() {
    if (this.taskTitle.trim()) {
      // Get assigned member info if selected
      let assignedToName = '';
      let assignedToEmail = '';
      if (this.assignedTo) {
        const member = this.groupMembers.find((m) => m._id === this.assignedTo);
        if (member) {
          assignedToName = member.name;
          assignedToEmail = member.email;

          // Send notification to assigned member
          this.notificationService.createTaskAssignmentNotification(
            this.taskTitle.trim(),
            assignedToName,
            assignedToEmail
          );
        }
      }

      this.taskService.addTask(
        this.taskTitle.trim(),
        this.taskDescription.trim(),
        this.taskPriority,
        this.columnStatus,
        this.taskDueDate || undefined,
        this.assignedTo || undefined,
        assignedToName || undefined,
        assignedToEmail || undefined
      );
      this.taskAdded.emit();
      this.hideForm();
    }
  }

  onFormSubmit() {
    this.submitTask();
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') this.hideForm();
  }
}
