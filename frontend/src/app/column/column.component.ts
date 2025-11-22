import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskComponent } from '../task/task.component';
import { AddTaskComponent } from '../add-task/add-task.component';
import { Task, TaskService } from '../services/task.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskComponent, AddTaskComponent],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css',
})
export class ColumnComponent implements OnInit {
  @Input() columnId!: string;
  @Input() title!: string;
  @Input() tasks: Task[] = [];
  @Output() tasksUpdated = new EventEmitter<void>();
  @Output() addColumnRequested = new EventEmitter<string>();
  @Output() removeColumnRequested = new EventEmitter<string>();
  @Output() columnTitleUpdated = new EventEmitter<{
    id: string;
    title: string;
  }>();
  @Output() columnDragStart = new EventEmitter<void>();

  isDragOver = false;
  dragOverIndex = -1;
  isEditingTitle = false;
  editTitle = '';
  searchQuery = '';

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Debug: Log permission check after initialization
    const user = this.authService.getCurrentUser();
    console.log('Column Component Initialized:', {
      user: user,
      userRole: user?.role,
      userType: user?.userType,
      isGroupMember: this.authService.isGroupMember(),
      isGroupLeader: this.authService.isGroupLeader(),
      canAddTasks: this.canAddTasks,
      canManageColumns: this.canManageColumns,
    });
  }

  get canAddTasks(): boolean {
    // All users can add tasks (single users, group leaders, and group members)
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.log('canAddTasks: No user found, returning false');
      return false;
    }

    // Single users can add tasks
    if (user.userType === 'single') {
      console.log('canAddTasks: Single user, returning true');
      return true;
    }

    // Group leaders can add tasks
    if (user.role === 'leader') {
      console.log('canAddTasks: Group leader, returning true');
      return true;
    }

    // Group members can also add tasks
    console.log('canAddTasks: Group member, returning true');
    return true;
  }

  get canManageColumns(): boolean {
    // Only group leaders and single users can manage columns
    // Group members CANNOT manage columns
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // Single users can manage columns
    if (user.userType === 'single') return true;

    // Group leaders can manage columns
    if (user.role === 'leader') return true;

    // Group members cannot manage columns
    return false;
  }

  get filteredTasks(): Task[] {
    if (!this.searchQuery.trim()) {
      return this.tasks;
    }
    const query = this.searchQuery.toLowerCase();
    return this.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
    );
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    this.isDragOver = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;
    this.dragOverIndex = -1;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;
    this.dragOverIndex = -1;
    const taskId = parseInt(e.dataTransfer!.getData('text/plain'));
    const task = this.taskService.getTaskById(taskId);
    if (task && task.status !== this.columnId) {
      this.taskService.moveTask(taskId, this.columnId);
      this.tasksUpdated.emit();
    }
  }

  onDragOverAtIndex(e: DragEvent, index: number) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer!.dropEffect = 'move';
    this.dragOverIndex = index;
    this.isDragOver = true;
  }

  onDropAtIndex(e: DragEvent, targetIndex: number) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = false;
    this.dragOverIndex = -1;

    const taskId = parseInt(e.dataTransfer!.getData('text/plain'));
    if (isNaN(taskId)) return;
    const task = this.taskService.getTaskById(taskId);
    if (!task) return;

    if (task.status === this.columnId) {
      const currentIndex = this.tasks.findIndex((t) => t.id === taskId);
      if (currentIndex !== targetIndex && currentIndex + 1 !== targetIndex) {
        this.taskService.reorderTasksInColumn(
          this.columnId,
          taskId,
          targetIndex
        );
        this.tasksUpdated.emit();
      }
    } else {
      this.taskService.moveTask(taskId, this.columnId);
      this.tasksUpdated.emit();
    }
  }

  onTaskAdded = () => this.tasksUpdated.emit();
  onTaskUpdated = () => this.tasksUpdated.emit();
  onTaskDeleted = () => this.tasksUpdated.emit();
  getColumnClass() {
    return 'kanban-column' + (this.isDragOver ? ' drag-over' : '');
  }
  // Column title editing methods
  startEditTitle() {
    this.isEditingTitle = true;
    this.editTitle = this.title;
  }

  saveTitle() {
    if (this.editTitle.trim() && this.editTitle.trim() !== this.title) {
      this.columnTitleUpdated.emit({
        id: this.columnId,
        title: this.editTitle.trim(),
      });
    }
    this.isEditingTitle = false;
  }

  cancelEditTitle() {
    this.isEditingTitle = false;
    this.editTitle = this.title;
  }
  requestAddColumn = () => this.addColumnRequested.emit(this.columnId);

  requestRemoveColumn() {
    const confirmDelete = confirm(
      `Are you sure you want to delete the "${this.title}" column? All tasks will be moved to another column.`
    );
    if (confirmDelete) {
      this.removeColumnRequested.emit(this.columnId);
    }
  }

  canRemoveColumn = () =>
    !['todo', 'inprogress', 'done'].includes(this.columnId);
  isDefaultColumn = () =>
    ['todo', 'inprogress', 'done'].includes(this.columnId);
  trackTaskById = (index: number, task: Task) => task.id;

  onColumnHeaderDragStart(event: DragEvent) {
    // Only allow leaders and single users to drag columns
    if (!this.canManageColumns) {
      event.preventDefault();
      return;
    }
    event.dataTransfer!.setData('application/x-column-drag', this.columnId);
    event.dataTransfer!.effectAllowed = 'move';
    this.columnDragStart.emit();
  }
}
