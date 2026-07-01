import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Standalone Signals for reactive state
  currentUser = signal<{ username: string; role: string; fullName: string } | null>(null);
  token = signal<string | null>(null);

  constructor(private http: HttpClient) {
    // Restore session on load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      this.token.set(storedToken);
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  login(credentials: { username: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        const user = {
          username: res.username,
          role: res.role,
          fullName: res.fullName
        };
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(user));
        this.token.set(res.token);
        this.currentUser.set(user);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAuthenticated(): boolean {
    return this.token() !== null;
  }
}
