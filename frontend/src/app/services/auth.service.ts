import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  userType: 'single' | 'group';
  role?: 'leader' | 'member' | 'none';
  accessKey?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    userType?: string;
    role?: string;
    groupId?: string;
    accessKey?: string;
    createdAt?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private userApiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  signup(userData: SignupData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, userData);
  }

  login(credentials: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('kanban_user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('kanban_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getUserRole(): string {
    const user = this.getCurrentUser();
    return user?.role || 'none';
  }

  isGroupLeader(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'leader';
  }

  isGroupMember(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'member';
  }

  getGroupMembers(): Observable<any> {
    const user = this.getCurrentUser();
    const headers = { 'user-id': user?.id || '' };
    return this.http.get(`${this.userApiUrl}/group-members`, { headers });
  }

  logout(): void {
    localStorage.removeItem('kanban_user');
  }
}
