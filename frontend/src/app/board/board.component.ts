import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ColumnComponent } from '../column/column.component';
import { TaskService, Column } from '../services/task.service';
import { AuthService } from '../services/auth.service';
import {
  NotificationService,
  Notification,
} from '../services/notification.service';
import { Subscription, combineLatest, interval } from 'rxjs';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, ColumnComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent implements OnInit, OnDestroy {
  columns: Column[] = [];
  showAddColumn = false;
  newColumnTitle = '';
  selectedColumnId = '';
  private subscription = new Subscription();
  draggedColumnIndex = -1;
  dragOverColumnIndex = -1;
  userName: string = '';
  userRole: string = '';
  globalSearchQuery = '';
  currentUserId: string = '';
  isGroupLeader: boolean = false;
  isGroupMember: boolean = false;

  // Notification properties
  notifications: Notification[] = [];
  unreadNotifications = 0;
  showNotifications = false;
  private notificationCheckInterval: any;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container')) {
      this.showNotifications = false;
    }
  }

  ngOnInit() {
    this.loadUserInfo();
    this.taskService.initializeBoard();

    // Debug: Log button visibility
    setTimeout(() => {
      console.log('🔴 CLEAR BOARD BUTTON VISIBILITY:', {
        canManageBoard: this.canManageBoard,
        isGroupMember: this.isGroupMember,
        isGroupLeader: this.isGroupLeader,
        shouldShowButton: this.canManageBoard,
        buttonElement: document.querySelector('.clear-board-btn'),
      });
    }, 1000);

    this.subscription.add(
      combineLatest([
        this.taskService.tasks$,
        this.taskService.columns$,
      ]).subscribe(() => {
        this.columns = this.getFilteredTasksByRole();
      })
    );

    // Load notifications
    this.loadNotifications();

    // Poll for new notifications every 30 seconds
    this.notificationCheckInterval = setInterval(() => {
      this.loadNotifications();
    }, 30000);

    // Listen for storage changes to prevent tab switching
    this.preventTabOverride();
  }

  loadUserInfo() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name || 'User';
      this.currentUserId = user.id;
      this.isGroupLeader = this.authService.isGroupLeader();
      this.isGroupMember = this.authService.isGroupMember();

      // Format role for display
      if (user.userType === 'single') {
        this.userRole = 'Individual User';
      } else if (user.role === 'leader') {
        this.userRole = 'Group Leader';
      } else if (user.role === 'member') {
        this.userRole = 'Group Member';
      } else {
        this.userRole = 'User';
      }

      console.log('🔍 Board User Info Loaded:', {
        name: this.userName,
        userId: this.currentUserId,
        userType: user.userType,
        role: user.role,
        displayRole: this.userRole,
        isGroupLeader: this.isGroupLeader,
        isGroupMember: this.isGroupMember,
        canManageBoard: this.canManageBoard,
        groupId: user.groupId,
      });
    } else {
      console.error('❌ No user found in localStorage!');
    }
  }

  // Filter tasks based on user role
  getFilteredTasksByRole(): Column[] {
    const allColumns = this.taskService.getTasksByColumns();

    // Group leaders see all tasks
    if (this.isGroupLeader) {
      return allColumns;
    }

    // Group members see only their assigned tasks (but show all columns)
    if (this.isGroupMember) {
      return allColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter(
          (task) => task.assignedTo === this.currentUserId
        ),
      }));
    }

    // Single users see all their tasks
    return allColumns;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval);
    }
  }

  get canManageBoard(): boolean {
    // Only group leaders and single users can manage board (add/remove columns)
    return !this.isGroupMember;
  }

  addColumn() {
    if (!this.canManageBoard) {
      console.log('Permission denied: Only group leaders can add columns');
      return;
    }
    if (this.newColumnTitle.trim()) {
      this.taskService.addColumn(this.newColumnTitle, this.selectedColumnId);
      this.showAddColumn = false;
      this.newColumnTitle = this.selectedColumnId = '';
    }
  }

  openAddColumnForm(columnId: string) {
    if (!this.canManageBoard) {
      console.log('Permission denied: Only group leaders can add columns');
      return;
    }
    this.selectedColumnId = columnId;
    this.showAddColumn = true;
    this.newColumnTitle = '';
  }

  cancelAddColumn() {
    this.showAddColumn = false;
    this.newColumnTitle = this.selectedColumnId = '';
  }

  removeColumn(columnId: string) {
    if (this.taskService.removeColumn(columnId)) this.onTasksUpdated();
  }

  onTasksUpdated = () => {
    this.columns = this.getFilteredTasksByRole();
    // Refresh notifications when tasks are updated/deleted
    this.loadNotifications();
  };

  getTaskStatistics() {
    const stats: any = {};
    this.columns.forEach((column) => {
      stats[column.id] = { title: column.title, count: column.tasks.length };
    });
    stats.total = this.columns.reduce((sum, col) => sum + col.tasks.length, 0);
    return stats;
  }

  getAllColumnsStats() {
    return this.columns.map((column) => ({
      id: column.id,
      title: column.title,
      count: column.tasks.length,
    }));
  }

  get filteredColumns(): Column[] {
    if (!this.globalSearchQuery.trim()) {
      return this.columns;
    }
    const query = this.globalSearchQuery.toLowerCase();
    // Only filter by column title, show all tasks in matching columns
    return this.columns.filter((column) =>
      column.title.toLowerCase().includes(query)
    );
  }

  trackColumnById = (index: number, column: Column) => column.id;

  updateColumnTitle(event: { id: string; title: string }) {
    this.taskService.updateColumnTitle(event.id, event.title);
    this.onTasksUpdated();
  }

  onColumnDragStart = (columnIndex: number) =>
    (this.draggedColumnIndex = columnIndex);

  onColumnDragOver(event: DragEvent, columnIndex: number) {
    event.preventDefault();
    if (event.dataTransfer!.types.includes('application/x-column-drag')) {
      event.dataTransfer!.dropEffect = 'move';
      this.dragOverColumnIndex = columnIndex;
    }
  }

  onColumnDragLeave = () => (this.dragOverColumnIndex = -1);

  onColumnDrop(event: DragEvent, targetColumnIndex: number) {
    event.preventDefault();
    const draggedColumnId = event.dataTransfer!.getData(
      'application/x-column-drag'
    );
    if (draggedColumnId) {
      const targetColumn = this.columns[targetColumnIndex];
      if (targetColumn && draggedColumnId !== targetColumn.id) {
        this.taskService.reorderColumns(draggedColumnId, targetColumn.id);
        this.onTasksUpdated();
      }
    }
    this.draggedColumnIndex = this.dragOverColumnIndex = -1;
  }

  getColumnDragClass(columnIndex: number): string {
    let classes = 'column-wrapper';
    if (this.draggedColumnIndex === columnIndex) classes += ' dragging';
    if (
      this.dragOverColumnIndex === columnIndex &&
      this.draggedColumnIndex !== columnIndex
    ) {
      classes += ' drag-over';
    }
    return classes;
  }

  // Notification methods
  loadNotifications() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.notificationService.getNotifications(user.id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notifications = response.notifications || [];
          this.unreadNotifications = this.notifications.filter(
            (n) => !n.isRead
          ).length;
        }
      },
      error: (error) => {
        console.error('Failed to load notifications:', error);
      },
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: Notification) {
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification._id).subscribe({
      next: () => {
        notification.isRead = true;
        this.unreadNotifications = this.notifications.filter(
          (n) => !n.isRead
        ).length;
      },
      error: (error) => {
        console.error('Failed to mark notification as read:', error);
      },
    });
  }

  markAllAsRead() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.notificationService.markAllAsRead(user.id).subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.isRead = true));
        this.unreadNotifications = 0;
      },
      error: (error) => {
        console.error('Failed to mark all as read:', error);
      },
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notificationDate.toLocaleDateString();
  }

  // Prevent localStorage override when opening multiple tabs
  preventTabOverride() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Store the session ID for this tab
    const sessionId = `kanban_session_${currentUser.id}`;
    const tabId = Date.now().toString();
    sessionStorage.setItem('kanban_tab_id', tabId);

    // Listen for storage changes from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'kanban_user' && event.newValue) {
        const newUser = JSON.parse(event.newValue);
        const storedUser = this.authService.getCurrentUser();

        // If another tab logged in with a different user, warn this tab
        if (newUser.id !== storedUser?.id) {
          console.warn(
            '⚠️ Different user logged in on another tab. Current session:',
            storedUser?.email
          );
          // Optionally: Show a notification or force reload
          // this.router.navigate(['/']);
        }
      }
    });
  }

  clearAllBoard() {
    console.log('🗑️ Clear All Board clicked', {
      canManageBoard: this.canManageBoard,
      isGroupLeader: this.isGroupLeader,
      isGroupMember: this.isGroupMember,
    });

    if (!this.canManageBoard) {
      console.log('Permission denied: Only group leaders can clear board');
      return;
    }

    const confirmed = confirm(
      '⚠️ Are you sure you want to clear the entire board? This will delete all tasks, comments, and notifications. This action cannot be undone!'
    );

    if (confirmed) {
      this.taskService.clearBoard();
      // Refresh notifications after clearing
      setTimeout(() => {
        this.loadNotifications();
      }, 500);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
