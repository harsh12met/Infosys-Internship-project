import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastService } from './toast.service';
import { environment } from '../../environments/environment';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: string;
  createdAt: Date;
  order: number;
  dueDate?: Date;
  assignedTo?: string;
  assignedToName?: string;
  assignedToEmail?: string;
}

export interface TaskForStorage {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: string;
  createdAt: string;
  order: number;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  order: number;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private columnsSubject = new BehaviorSubject<Column[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  public columns$ = this.columnsSubject.asObservable();
  private nextTaskId = 1;
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private toastService: ToastService, private http: HttpClient) {
    this.initializeBoard();
  }

  public getOwnerInfo(): {
    ownerId: string;
    ownerType: 'user' | 'group';
  } | null {
    const userStr = localStorage.getItem('kanban_user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);

    // For group members and leaders, use groupId
    if (user.groupId) {
      return { ownerId: user.groupId, ownerType: 'group' };
    }

    // For single users, use their user id
    return { ownerId: user.id, ownerType: 'user' };
  }

  public initializeBoard() {
    this.loadBoardFromServer();
  }

  private loadBoardFromServer() {
    const ownerInfo = this.getOwnerInfo();
    if (!ownerInfo) return;

    this.http
      .get<any>(`${this.apiUrl}/boards`, {
        params: {
          ownerId: ownerInfo.ownerId,
          ownerType: ownerInfo.ownerType,
        },
      })
      .subscribe({
        next: (response) => {
          if (response.success && response.board) {
            this.loadBoardData(response.board);
          }
        },
        error: (error) => {
          console.error('Failed to load board:', error);
          this.toastService.error('Failed to load board from server');
        },
      });
  }

  private loadBoardData(board: any) {
    const columns = board.columns || [];
    let allTasks: Task[] = [];
    let taskId = 1;

    // If board has no columns (new user), start with empty board
    if (columns.length === 0) {
      console.log('🆕 New board detected - starting with blank board');
      this.columnsSubject.next([]);
      this.tasksSubject.next([]);
      this.nextTaskId = 1;
      return;
    }

    columns.forEach((column: any) => {
      column.tasks?.forEach((task: any, index: number) => {
        allTasks.push({
          id: taskId++,
          title: task.title || 'Untitled Task',
          description: task.description || '',
          priority: task.priority || 'Medium',
          status: column.id,
          createdAt: new Date(task.createdAt),
          order: task.order !== undefined ? task.order : index,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          assignedTo: task.assignedTo,
          assignedToName: task.assignedToName,
          assignedToEmail: task.assignedToEmail,
        });
      });
    });

    this.tasksSubject.next(allTasks);
    this.nextTaskId = taskId;
    this.columnsSubject.next(
      columns.map((col: any) => ({
        id: col.id,
        title: col.title,
        order: col.order || 0,
        tasks: [],
      }))
    );
  }

  private saveBoardToServer() {
    const ownerInfo = this.getOwnerInfo();
    if (!ownerInfo) return;

    const tasks = this.getTasks();
    const columnsWithTasks = this.getColumns().map((column) => ({
      id: column.id,
      title: column.title,
      order: column.order,
      tasks: tasks
        .filter((task) => task.status === column.id)
        .sort((a, b) => a.order - b.order)
        .map((task) => ({
          id: task.id.toString(),
          title: task.title,
          description: task.description,
          priority: task.priority,
          order: task.order,
          createdAt: task.createdAt.toISOString(),
          dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
          assignedTo: task.assignedTo,
          assignedToName: task.assignedToName,
          assignedToEmail: task.assignedToEmail,
        })),
    }));

    console.log('💾 Saving board to server:', {
      ownerId: ownerInfo.ownerId,
      ownerType: ownerInfo.ownerType,
      columnCount: columnsWithTasks.length,
      totalTasks: tasks.length,
      apiUrl: `${this.apiUrl}/boards`,
    });

    this.http
      .put<any>(`${this.apiUrl}/boards`, {
        ownerId: ownerInfo.ownerId,
        ownerType: ownerInfo.ownerType,
        columns: columnsWithTasks,
      })
      .subscribe({
        next: (response) => {
          console.log('✅ Board saved to server successfully:', response);
          if (!response.success) {
            console.error('Failed to save board');
          }
        },
        error: (error) => {
          console.error('❌ Failed to save board:', error);
          this.toastService.error('Failed to save changes to server');
        },
      });
  }

  getTasks() {
    return this.tasksSubject.value;
  }

  getColumns() {
    return this.columnsSubject.value;
  }

  getTasksByColumns(): Column[] {
    const tasks = this.getTasks();
    return this.getColumns()
      .map((col) => ({
        ...col,
        tasks: tasks
          .filter((t) => t.status === col.id)
          .sort((a, b) => a.order - b.order),
      }))
      .sort((a, b) => a.order - b.order);
  }

  addColumn(title: string, afterColumnId?: string) {
    const columns = this.getColumns();
    const baseId = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    let newId = baseId,
      counter = 1;
    while (columns.some((col) => col.id === newId)) {
      newId = `${baseId}${counter++}`;
    }

    let order = columns.length;
    if (afterColumnId) {
      const afterCol = columns.find((c) => c.id === afterColumnId);
      if (afterCol) {
        columns
          .filter((c) => c.order > afterCol.order)
          .forEach((c) => c.order++);
        order = afterCol.order + 1;
      }
    }

    this.columnsSubject.next(
      [...columns, { id: newId, title: title.trim(), tasks: [], order }].sort(
        (a, b) => a.order - b.order
      )
    );
    this.saveBoardToServer();
    this.toastService.success(
      `Column "${title.trim()}" created successfully! 🎉`
    );
  }

  addTask(
    title: string,
    description: string,
    priority: 'Low' | 'Medium' | 'High',
    status = 'todo',
    dueDate?: string,
    assignedTo?: string,
    assignedToName?: string,
    assignedToEmail?: string
  ) {
    const tasks = this.getTasks();
    const maxOrder = Math.max(
      ...tasks.filter((t) => t.status === status).map((t) => t.order),
      -1
    );
    const newTask: Task = {
      id: this.nextTaskId++,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      createdAt: new Date(),
      order: maxOrder + 1,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedTo,
      assignedToName,
      assignedToEmail,
    };
    this.tasksSubject.next([...tasks, newTask]);
    this.saveBoardToServer();
    this.toastService.success(`Task "${title.trim()}" added successfully! ✅`);
  }

  updateTask(taskId: number, updates: Partial<Task>) {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      const taskTitle = tasks[index].title;
      tasks[index] = { ...tasks[index], ...updates };
      this.tasksSubject.next([...tasks]);
      this.saveBoardToServer();
      this.toastService.success(`Task "${taskTitle}" updated successfully! 📝`);
    }
  }

  deleteTask(taskId: number) {
    const tasks = this.getTasks();
    const taskTitle = tasks.find((t) => t.id === taskId)?.title || 'Task';
    console.log('🗑️ Deleting task:', {
      taskId,
      taskTitle,
      beforeCount: tasks.length,
    });
    this.tasksSubject.next(tasks.filter((t) => t.id !== taskId));
    this.saveBoardToServer();
    console.log('✅ Task deleted, board saved to server');
    this.toastService.success(`Task "${taskTitle}" deleted successfully! 🗑️`);
  }

  moveTask(taskId: number, newStatus: string) {
    const task = this.getTaskById(taskId);
    if (task && task.status !== newStatus) {
      const columnTitle =
        this.getColumns().find((c) => c.id === newStatus)?.title || newStatus;
      const tasks = this.getTasks();
      const index = tasks.findIndex((t) => t.id === taskId);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], status: newStatus };
        this.tasksSubject.next([...tasks]);
        this.saveBoardToServer();
        this.toastService.info(
          `Task "${task.title}" moved to "${columnTitle}" 🔄`
        );
      }
    }
  }

  getTaskById(taskId: number) {
    return this.getTasks().find((t) => t.id === taskId);
  }

  reorderTasksInColumn(
    columnId: string,
    draggedTaskId: number,
    targetIndex: number
  ) {
    const tasks = this.getTasks();
    const columnTasks = tasks
      .filter((t) => t.status === columnId)
      .sort((a, b) => a.order - b.order);
    const draggedTask = columnTasks.find((t) => t.id === draggedTaskId);
    if (
      !draggedTask ||
      columnTasks.findIndex((t) => t.id === draggedTaskId) === targetIndex
    )
      return;

    const reordered = columnTasks.filter((t) => t.id !== draggedTaskId);
    reordered.splice(Math.min(targetIndex, reordered.length), 0, draggedTask);
    reordered.forEach((task, i) => (task.order = i));

    this.tasksSubject.next(
      tasks.map((t) =>
        t.status === columnId ? reordered.find((rt) => rt.id === t.id) || t : t
      )
    );
    this.saveBoardToServer();
    this.toastService.info(
      `Task "${draggedTask.title}" reordered within column! ↕️`
    );
  }

  removeColumn(columnId: string): boolean {
    const columns = this.getColumns();
    const columnToDelete = columns.find((c) => c.id === columnId);

    console.log('🗑️ Attempting to delete column:', {
      columnId,
      columnTitle: columnToDelete?.title,
      totalColumns: columns.length,
    });

    // Allow deletion of all columns, including the last one
    const fallbackColumn = columns.find((c) => c.id !== columnId);

    // If this is the last column, delete it without moving tasks
    if (!fallbackColumn) {
      console.log('🗑️ Deleting last column - no tasks to migrate');
      const updatedColumns: Column[] = [];
      this.columnsSubject.next(updatedColumns);
      this.tasksSubject.next([]);
      this.saveBoardToServer();
      this.toastService.success(
        `Column "${columnToDelete?.title}" deleted successfully! 🗑️`
      );
      return true;
    }

    console.log('🔄 Moving tasks from', columnId, 'to', fallbackColumn.id);
    const tasks = this.getTasks();
    const updatedTasks = tasks.map((task) =>
      task.status === columnId ? { ...task, status: fallbackColumn.id } : task
    );
    const updatedColumns = columns
      .filter((c) => c.id !== columnId)
      .map((col, idx) => ({ ...col, order: idx }));

    this.columnsSubject.next(updatedColumns);
    this.tasksSubject.next(updatedTasks);
    this.saveBoardToServer();
    console.log('✅ Column deleted successfully, board saved to server');
    this.toastService.success(
      `Column "${columnToDelete?.title}" deleted successfully! 🗑️`
    );
    return true;
  }

  clearBoard() {
    const ownerInfo = this.getOwnerInfo();
    if (!ownerInfo) return;

    // Reset to default columns only
    const defaultColumns: Column[] = [
      { id: 'todo', title: 'To Do', order: 0, tasks: [] },
      { id: 'inprogress', title: 'In Progress', order: 1, tasks: [] },
      { id: 'done', title: 'Done', order: 2, tasks: [] },
    ];

    console.log('🧹 Clearing board - resetting to default columns');

    // First, call backend to clear comments and notifications
    this.http
      .post<any>(`${this.apiUrl}/boards/clear`, {
        ownerId: ownerInfo.ownerId,
        ownerType: ownerInfo.ownerType,
      })
      .subscribe({
        next: (response) => {
          console.log('✅ Backend cleared comments and notifications');
          // Then update the board
          this.columnsSubject.next(defaultColumns);
          this.tasksSubject.next([]);
          this.saveBoardToServer();
          this.toastService.success(
            'Board cleared successfully! All tasks, comments, and notifications removed. 🧹'
          );
        },
        error: (error) => {
          console.error('❌ Failed to clear board data:', error);
          // Still clear the board locally even if backend fails
          this.columnsSubject.next(defaultColumns);
          this.tasksSubject.next([]);
          this.saveBoardToServer();
          this.toastService.warning(
            'Board cleared but some data may remain in database.'
          );
        },
      });
  }

  isDefaultColumn(columnId: string): boolean {
    return ['todo', 'inprogress', 'done'].includes(columnId);
  }

  updateColumnTitle(columnId: string, newTitle: string) {
    const columns = this.getColumns();
    const oldTitle = columns.find((c) => c.id === columnId)?.title;
    this.columnsSubject.next(
      columns.map((col) =>
        col.id === columnId ? { ...col, title: newTitle } : col
      )
    );
    this.saveBoardToServer();
    this.toastService.success(
      `Column renamed from "${oldTitle}" to "${newTitle}" 📝`
    );
  }

  reorderColumns(fromColumnId: string, toColumnId: string) {
    const columns = this.getColumns();
    const fromIndex = columns.findIndex((c) => c.id === fromColumnId);
    const toIndex = columns.findIndex((c) => c.id === toColumnId);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      const draggedColumn = columns[fromIndex];
      columns.splice(fromIndex, 1);
      columns.splice(toIndex, 0, draggedColumn);
      columns.forEach((col, index) => (col.order = index));
      this.columnsSubject.next([...columns]);
      this.saveBoardToServer();
      this.toastService.info(
        `Column "${draggedColumn.title}" reordered successfully! 🔄`
      );
    }
  }
}
