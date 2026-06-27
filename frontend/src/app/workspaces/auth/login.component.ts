import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-[color:var(--bg-primary)] px-4 py-2 sm:px-6 lg:px-8 transition-colors">
      <div class="w-full max-w-sm space-y-4 glass-card p-5 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] shadow-xl rounded-2xl">
        
        <!-- Logo and Heading -->
        <div class="text-center">
          <div class="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/20">
            S
          </div>
          <h2 class="mt-2 text-xl font-bold tracking-tight text-[color:var(--text-primary)]">
            SCM Enterprise Log In
          </h2>
          <p class="mt-0.5 text-[11px] text-[color:var(--text-secondary)]">
            Manage procurement, inventory, and logistics workflows.
          </p>
        </div>

        <!-- Feedback Messages -->
        <div *ngIf="errorMsg()" class="p-2.5 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
          {{ errorMsg() }}
        </div>

        <!-- Form -->
        <form class="mt-3 space-y-3.5" (submit)="onSubmit()">
          <div class="space-y-3 rounded-md">
            <div>
              <label for="username" class="block text-[9px] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-0.5">Username</label>
              <input 
                id="username" 
                name="username" 
                type="text" 
                required 
                [(ngModel)]="credentials.username"
                class="w-full px-3.5 py-1.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter username"
              >
            </div>
            
            <div>
              <label for="password" class="block text-[9px] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-0.5">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                [(ngModel)]="credentials.password"
                class="w-full px-3.5 py-1.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="••••••••"
              >
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button 
              type="submit" 
              [disabled]="loading()"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/10"
            >
              <span *ngIf="loading()">Processing session...</span>
              <span *ngIf="!loading()">Secure Sign In</span>
            </button>
          </div>
        </form>

        <!-- Demo Account Autofills -->
        <div class="pt-3 border-t border-[color:var(--border-color)]">
          <p class="text-[9px] font-bold uppercase tracking-wider text-[color:var(--text-secondary)] text-center mb-1.5">Quick Demo Profiles</p>
          <div class="grid grid-cols-2 gap-1.5">
            <button 
              *ngFor="let role of demoAccounts" 
              (click)="autofill(role.user)"
              class="px-2 py-1 text-[9px] font-medium border border-[color:var(--border-color)] rounded-lg text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)] transition-colors text-left flex flex-col"
            >
              <span class="font-bold text-blue-600 dark:text-blue-400 capitalize">{{ role.name }}</span>
              <span class="text-[8px] text-[color:var(--text-secondary)]">User: {{ role.user }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  demoAccounts = [
    { name: 'Elizabeth Admin', user: 'admin' },
    { name: 'John Procurement', user: 'procurement' },
    { name: 'Sarah Inventory', user: 'inventory' },
    { name: 'Marcus Warehouse', user: 'warehouse' }
  ];

  constructor(private authService: AuthService, private router: Router) {
    // If already logged in, redirect
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  autofill(username: string) {
    this.credentials.username = username;
    this.credentials.password = 'password';
  }

  onSubmit() {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.error || 'Authentication failure. Check host connection.');
      }
    });
  }
}
