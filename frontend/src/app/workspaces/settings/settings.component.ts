import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-content-scroll bg-[color:var(--bg-primary)]">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[color:var(--text-primary)]">Settings & Audits</h1>
          <p class="text-xs text-[color:var(--text-secondary)]">Manage tenant configurations, oversee department budgets, and inspect compliance audit logs.</p>
        </div>
      </div>

      <!-- Navigation tabs -->
      <div class="flex border-b border-[color:var(--border-color)] mb-6 overflow-x-auto">
        <button 
          (click)="activeTab.set('tenant')"
          class="px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors"
          [class.border-blue-600]="activeTab() === 'tenant'"
          [class.text-blue-600]="activeTab() === 'tenant'"
          [class.border-transparent]="activeTab() !== 'tenant'"
          [class.text-[color:var(--text-secondary)]]="activeTab() !== 'tenant'"
        >
          Tenant & Budgets
        </button>
        <button 
          (click)="loadAuditLogs(); activeTab.set('audits')"
          class="px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors"
          [class.border-blue-600]="activeTab() === 'audits'"
          [class.text-blue-600]="activeTab() === 'audits'"
          [class.border-transparent]="activeTab() !== 'audits'"
          [class.text-[color:var(--text-secondary)]]="activeTab() !== 'audits'"
        >
          Compliance Audit Trails
        </button>
        <button 
          *ngIf="authService.hasRole(['SUPER_ADMIN'])"
          (click)="loadUsers(); activeTab.set('users')"
          class="px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors"
          [class.border-blue-600]="activeTab() === 'users'"
          [class.text-blue-600]="activeTab() === 'users'"
          [class.border-transparent]="activeTab() !== 'users'"
          [class.text-[color:var(--text-secondary)]]="activeTab() !== 'users'"
        >
          User Management
        </button>
      </div>

      <!-- SUBSECTION 1: TENANT & BUDGETS -->
      <div *ngIf="activeTab() === 'tenant'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Multi-tenant config -->
        <div class="lg:col-span-2 space-y-6">
          <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <h3 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Multi-Tenant Organization Configuration</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="p-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]">
                <span class="text-[10px] text-[color:var(--text-secondary)] uppercase font-bold tracking-wide">Tenant Name</span>
                <p class="font-bold mt-1 text-[color:var(--text-primary)]">Enterprise Supply Chain Corp</p>
              </div>
              <div class="p-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]">
                <span class="text-[10px] text-[color:var(--text-secondary)] uppercase font-bold tracking-wide">Domain Mapping</span>
                <p class="font-bold mt-1 text-[color:var(--text-primary)]">scm-corp.com</p>
              </div>
              <div class="p-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]">
                <span class="text-[10px] text-[color:var(--text-secondary)] uppercase font-bold tracking-wide">System Tenant ID</span>
                <p class="font-bold mt-1 text-[color:var(--text-primary)]">ORG-001</p>
              </div>
              <div class="p-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]">
                <span class="text-[10px] text-[color:var(--text-secondary)] uppercase font-bold tracking-wide">Registration Status</span>
                <p class="font-bold mt-1 text-emerald-500">ACTIVE & VERIFIED</p>
              </div>
            </div>
          </div>

          <!-- Department budget ledgers -->
          <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <h3 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Departmental Budgets & Spending Caps</h3>
            
            <div *ngIf="departments().length === 0" class="text-center py-8 text-xs text-[color:var(--text-secondary)]">
              Loading department budgets...
            </div>
            
            <div class="space-y-4">
              <div *ngFor="let dept of departments()" class="p-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-bold text-xs text-[color:var(--text-primary)]">{{ dept.name }} ({{ dept.code }})</span>
                  <span class="text-xs text-[color:var(--text-secondary)]">Remaining: <strong>₹{{ dept.remainingBudget | number }}</strong></span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div class="h-full bg-blue-600 transition-all" [style.width.%]="(dept.remainingBudget / dept.budgetLimit) * 100"></div>
                </div>
                <div class="flex justify-between text-[10px] text-[color:var(--text-secondary)] mt-1.5">
                  <span>Cap: ₹{{ dept.budgetLimit | number }}</span>
                  <span>Usage: {{ ((dept.budgetLimit - dept.remainingBudget) / dept.budgetLimit) * 100 | number:'1.0-1' }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Col: System diagnostics -->
        <div class="space-y-6">
          <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <h3 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Node Telemetry</h3>
            
            <div class="space-y-3 text-xs text-[color:var(--text-secondary)]">
              <p class="flex justify-between"><span>Core Services:</span><span class="text-emerald-500 font-bold">ONLINE</span></p>
              <p class="flex justify-between"><span>Kafka Broker:</span><span class="text-emerald-500 font-bold">ONLINE</span></p>
              <p class="flex justify-between"><span>Redis Cache:</span><span class="text-emerald-500 font-bold">ONLINE</span></p>
              <p class="flex justify-between"><span>PostgreSQL Node:</span><span class="text-emerald-500 font-bold">ONLINE</span></p>
            </div>
          </div>
        </div>

      </div>

      <!-- SUBSECTION 2: COMPLIANCE AUDIT TRAILS -->
      <div *ngIf="activeTab() === 'audits'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-sm font-bold text-[color:var(--text-primary)]">System Security Audit Ledger</h3>
          <button (click)="loadAuditLogs()" class="px-3 py-1.5 rounded-lg bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-xs font-semibold">
            Refresh
          </button>
        </div>

        <div class="glass-card bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] font-semibold uppercase">
                  <th class="p-4">Timestamp</th>
                  <th class="p-4">Action</th>
                  <th class="p-4">Details</th>
                  <th class="p-4">User</th>
                  <th class="p-4">Network IP</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:var(--border-color)] text-[color:var(--text-primary)]">
                <tr *ngIf="auditLogs().length === 0">
                  <td colspan="5" class="p-8 text-center text-[color:var(--text-secondary)]">Loading audit logs...</td>
                </tr>
                <tr *ngFor="let log of auditLogs()" class="hover:bg-slate-500/5">
                  <td class="p-4 text-[color:var(--text-secondary)]">{{ log.createdAt | date:'medium' }}</td>
                  <td class="p-4"><span class="badge badge-info">{{ log.action }}</span></td>
                  <td class="p-4 font-medium">{{ log.details }}</td>
                  <td class="p-4 font-bold">{{ log.userId }}</td>
                  <td class="p-4 text-[color:var(--text-secondary)]">{{ log.ipAddress }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SUBSECTION 3: USER MANAGEMENT -->
      <div *ngIf="activeTab() === 'users'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-sm font-bold text-[color:var(--text-primary)]">Platform User Accounts</h3>
          <button (click)="showCreateUser.set(true)" class="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
            + Create User
          </button>
        </div>

        <div class="glass-card bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] font-semibold uppercase">
                  <th class="p-4">User ID</th>
                  <th class="p-4">Full Name</th>
                  <th class="p-4">Username</th>
                  <th class="p-4">Role</th>
                  <th class="p-4">Status</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:var(--border-color)] text-[color:var(--text-primary)]">
                <tr *ngIf="users().length === 0">
                  <td colspan="6" class="p-8 text-center text-[color:var(--text-secondary)]">Loading users...</td>
                </tr>
                <tr *ngFor="let user of users()" class="hover:bg-slate-500/5">
                  <td class="p-4 font-bold text-blue-600 dark:text-blue-400">{{ user.id }}</td>
                  <td class="p-4 font-medium">{{ user.fullName }}</td>
                  <td class="p-4 text-[color:var(--text-secondary)]">{{ user.username }}</td>
                  <td class="p-4">
                    <select 
                      [value]="user.role"
                      (change)="changeRole(user.id, $event)"
                      class="px-2 py-1 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                    >
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      <option value="PROCUREMENT_MANAGER">PROCUREMENT_MANAGER</option>
                      <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
                      <option value="WAREHOUSE_MANAGER">WAREHOUSE_MANAGER</option>
                      <option value="LOGISTICS_MANAGER">LOGISTICS_MANAGER</option>
                      <option value="VENDOR">VENDOR</option>
                      <option value="EMPLOYEE">EMPLOYEE</option>
                    </select>
                  </td>
                  <td class="p-4">
                    <span class="badge" [ngClass]="{
                      'badge-success': user.status === 'ACTIVE',
                      'badge-danger': user.status === 'LOCKED'
                    }">{{ user.status }}</span>
                  </td>
                  <td class="p-4 text-right">
                    <button
                      *ngIf="user.status === 'ACTIVE'"
                      (click)="lockUser(user.id)"
                      class="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-[10px] transition-colors"
                    >
                      Lock
                    </button>
                    <button
                      *ngIf="user.status === 'LOCKED'"
                      (click)="unlockUser(user.id)"
                      class="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-[10px] transition-colors"
                    >
                      Unlock
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Create User Modal -->
        <div *ngIf="showCreateUser()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="w-full max-w-md bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] rounded-2xl shadow-2xl p-6 relative">
            <button (click)="showCreateUser.set(false)" class="absolute top-4 right-4 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 class="text-lg font-bold text-[color:var(--text-primary)] mb-4">Create New User</h2>
            
            <form (submit)="createUser()">
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" name="fullName" required [(ngModel)]="newUser.fullName"
                    class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:border-blue-500"
                    placeholder="John Smith">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Username</label>
                  <input type="text" name="username" required [(ngModel)]="newUser.username"
                    class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:border-blue-500"
                    placeholder="jsmith">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Email</label>
                  <input type="email" name="email" required [(ngModel)]="newUser.email"
                    class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:border-blue-500"
                    placeholder="john@scm.com">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Role</label>
                  <select name="role" required [(ngModel)]="newUser.role"
                    class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none">
                    <option value="PROCUREMENT_MANAGER">PROCUREMENT_MANAGER</option>
                    <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
                    <option value="WAREHOUSE_MANAGER">WAREHOUSE_MANAGER</option>
                    <option value="LOGISTICS_MANAGER">LOGISTICS_MANAGER</option>
                    <option value="VENDOR">VENDOR</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Password</label>
                  <input type="password" name="password" required [(ngModel)]="newUser.password"
                    class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:border-blue-500"
                    placeholder="••••••••">
                </div>
              </div>
              <div class="mt-6 flex justify-end gap-3">
                <button type="button" (click)="showCreateUser.set(false)" class="px-4 py-2 rounded-xl border border-[color:var(--border-color)] text-xs font-semibold text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)]">
                  Cancel
                </button>
                <button type="submit" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

    </div>
  `
})
export class SettingsComponent implements OnInit {
  activeTab = signal<string>('tenant');
  departments = signal<any[]>([]);
  auditLogs = signal<any[]>([]);
  users = signal<any[]>([]);
  showCreateUser = signal<boolean>(false);

  newUser = { fullName: '', username: '', email: '', role: 'EMPLOYEE', password: 'password' };

  constructor(
    private apiService: ApiService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.apiService.getDepartments().subscribe({
      next: (res) => this.departments.set(res),
      error: (err) => console.error('Failed to load departments', err)
    });
  }

  loadAuditLogs() {
    this.apiService.getAuditLogs().subscribe({
      next: (res) => this.auditLogs.set(res),
      error: (err) => console.error('Failed to load audit logs', err)
    });
  }

  loadUsers() {
    this.apiService.getUsers().subscribe({
      next: (res) => this.users.set(res),
      error: (err) => console.error('Failed to load users', err)
    });
  }

  changeRole(userId: string, event: any) {
    const newRole = (event.target as HTMLSelectElement).value;
    this.apiService.updateUserRole(userId, newRole).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Failed to update user role', err)
    });
  }

  lockUser(userId: string) {
    this.apiService.updateUserStatus(userId, 'LOCKED').subscribe(() => this.loadUsers());
  }

  unlockUser(userId: string) {
    this.apiService.updateUserStatus(userId, 'ACTIVE').subscribe(() => this.loadUsers());
  }

  createUser() {
    this.apiService.createUser(this.newUser).subscribe({
      next: () => {
        this.showCreateUser.set(false);
        this.newUser = { fullName: '', username: '', email: '', role: 'EMPLOYEE', password: 'password' };
        this.loadUsers();
      },
      error: (err) => alert('Failed to create user: ' + (err.error?.error || err.message))
    });
  }
}
