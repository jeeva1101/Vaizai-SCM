import { Component, signal, effect, HostBinding, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen overflow-hidden bg-[color:var(--bg-primary)]">
      
      <!-- SIDEBAR -->
      <aside 
        [class.w-64]="!sidebarCollapsed()" 
        [class.w-20]="sidebarCollapsed()" 
        class="flex flex-col border-r border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] transition-all duration-300 ease-in-out z-30"
      >
        <!-- Sidebar Brand Logo Header -->
        <div class="flex h-16 items-center justify-between px-4 border-b border-[color:var(--border-color)]">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-md shadow-blue-500/20">
              S
            </div>
            <div *ngIf="!sidebarCollapsed()" class="flex flex-col">
              <span class="font-bold tracking-tight text-[color:var(--text-primary)]">SCM Platform</span>
              <span class="text-xs text-blue-500 font-semibold tracking-wider uppercase">Enterprise</span>
            </div>
          </div>
          <button 
            (click)="toggleSidebar()" 
            class="hidden md:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
          >
            <!-- Sidebar toggle SVG -->
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- Navigation Menu Links -->
        <nav class="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <a 
            *ngFor="let item of filteredNavItems()" 
            [routerLink]="item.path" 
            routerLinkActive="bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400 font-semibold"
            [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] hover:text-[color:var(--text-primary)] transition-all group"
            [title]="item.name"
          >
            <!-- SVG Icon injection -->
            <span class="h-5 w-5 shrink-0" [innerHTML]="sanitize(item.icon)"></span>
            <span *ngIf="!sidebarCollapsed()" class="truncate">{{ item.name }}</span>
          </a>
        </nav>

        <!-- Sidebar Footer Logged In User profile summary -->
        <div class="border-t border-[color:var(--border-color)] p-4 bg-[color:var(--bg-secondary)]">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="h-10 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[color:var(--text-primary)] font-semibold shadow-inner">
              {{ (authService.currentUser()?.fullName || 'U').substring(0, 2).toUpperCase() }}
            </div>
            <div *ngIf="!sidebarCollapsed()" class="flex flex-col overflow-hidden">
              <span class="text-sm font-medium text-[color:var(--text-primary)] truncate">{{ authService.currentUser()?.fullName }}</span>
              <span class="text-xs text-[color:var(--text-secondary)] truncate font-semibold">{{ authService.currentUser()?.role?.replace('ROLE_', '') }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTAINER -->
      <div class="flex flex-col flex-1 overflow-hidden">
        
        <!-- HEADER TOP BAR -->
        <header class="h-16 border-b border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] flex items-center justify-between px-6 z-20 shadow-sm shadow-black/5">
          <!-- Left: Collapsible trigger and breadcrumbs -->
          <div class="flex items-center gap-4">
            <button (click)="toggleSidebar()" class="md:hidden text-[color:var(--text-secondary)]">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <!-- Breadcrumbs -->
            <div class="hidden sm:flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
              <span>SCM Console</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="font-medium text-[color:var(--text-primary)] capitalize">{{ activeRoute() }}</span>
            </div>
          </div>

          <!-- Right Action Controls -->
          <div class="flex items-center gap-4">
            
            <!-- Dark Mode Toggle Button -->
            <button 
              (click)="toggleDarkMode()" 
              class="h-9 w-9 rounded-lg hover:bg-[color:var(--bg-tertiary)] flex items-center justify-center text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              title="Toggle Dark/Light Mode"
            >
              <svg *ngIf="!isDarkMode()" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg *ngIf="isDarkMode()" class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </button>

            <!-- Notifications Center Dropdown Trigger -->
            <div class="relative">
              <button 
                (click)="toggleNotifications()" 
                class="h-9 w-9 rounded-lg hover:bg-[color:var(--bg-tertiary)] flex items-center justify-center text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] relative"
                title="Notifications"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <!-- Badge count -->
                <span *ngIf="notificationService.getUnreadCount() > 0" class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[color:var(--bg-secondary)]">
                  {{ notificationService.getUnreadCount() }}
                </span>
              </button>

              <!-- Notifications Overlay Menu -->
              <div 
                *ngIf="notificationsOpen()" 
                class="absolute right-0 mt-2 w-80 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-xl z-50 overflow-hidden"
              >
                <div class="flex items-center justify-between p-4 border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]">
                  <span class="font-bold text-sm text-[color:var(--text-primary)]">Notifications</span>
                  <button (click)="markAllNotificationsRead()" class="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Mark all read</button>
                </div>
                <div class="max-h-64 overflow-y-auto divide-y divide-[color:var(--border-color)]">
                  <div *ngIf="notificationService.notifications().length === 0" class="p-6 text-center text-xs text-[color:var(--text-secondary)]">
                    No new alerts.
                  </div>
                  <div 
                    *ngFor="let item of notificationService.notifications()" 
                    class="p-4 flex flex-col gap-1 hover:bg-[color:var(--bg-tertiary)] transition-colors cursor-pointer"
                    [class.bg-blue-500/5]="!item.isRead"
                    (click)="markNotificationRead(item.id)"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-semibold" [ngClass]="{
                        'text-amber-500': item.type === 'APPROVAL_REQUEST',
                        'text-red-500': item.type === 'STOCK_ALERT',
                        'text-blue-500': item.type === 'INFO'
                      }">{{ item.title }}</span>
                      <span class="text-[9px] text-[color:var(--text-secondary)]">Just now</span>
                    </div>
                    <span class="text-xs text-[color:var(--text-primary)]">{{ item.message }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Dropdown Menu Trigger -->
            <div class="relative">
              <button 
                (click)="toggleProfile()"
                class="h-9 w-9 rounded-lg hover:bg-[color:var(--bg-tertiary)] flex items-center justify-center border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)]"
              >
                <span class="text-xs font-bold text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
                  {{ (authService.currentUser()?.username || 'user').substring(0, 3).toUpperCase() }}
                </span>
              </button>

              <!-- Profile Menu Overlay -->
              <div 
                *ngIf="profileOpen()" 
                class="absolute right-0 mt-2 w-48 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-xl z-50 p-2 overflow-hidden"
              >
                <div class="px-3 py-2 border-b border-[color:var(--border-color)] mb-1">
                  <p class="text-xs font-semibold text-[color:var(--text-primary)] truncate">{{ authService.currentUser()?.fullName }}</p>
                  <p class="text-[10px] text-[color:var(--text-secondary)] truncate">{{ authService.currentUser()?.username }}&#64;scm-corp.com</p>
                </div>
                <a routerLink="/settings" (click)="profileOpen.set(false)" class="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)] transition-colors">
                  <span>Account Settings</span>
                </a>
                <button 
                  (click)="onLogout()" 
                  class="w-full text-left flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            
          </div>
        </header>

        <!-- MAIN VIEW CONTENT PANEL -->
        <main class="flex-1 overflow-hidden bg-[color:var(--bg-primary)]">
          <router-outlet></router-outlet>
        </main>

      </div>
    </div>
  `,
  styles: []
})
export class LayoutComponent {
  sidebarCollapsed = signal<boolean>(false);
  notificationsOpen = signal<boolean>(false);
  profileOpen = signal<boolean>(false);
  isDarkMode = signal<boolean>(false);
  activeRoute = signal<string>('dashboard');

  navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>` 
    },
    { 
      name: 'Procurement', 
      path: '/procurement', 
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>` 
    },
    { 
      name: 'Vendor Workspace', 
      path: '/vendor-portal', 
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>` 
    },
    { 
      name: 'Inventory', 
      path: '/inventory', 
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>` 
    },
    { 
      name: 'Warehouses', 
      path: '/warehouse', 
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>` 
    },
    { 
      name: 'Order Fulfillment', 
      path: '/orders', 
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` 
    },
    { 
      name: 'Logistics Fleet', 
      path: '/logistics', 
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm12 0a2 2 0 11-4 0 2 2 0 014 0zm-2-5.5h-8l-2.5-5h-3v5h-2.5v6.5a2 2 0 002 2h.1a2 2 0 013.8 0h4.8a2 2 0 013.8 0h.1a2 2 0 002-2v-4.5z"></path></svg>` 
    },
    { 
      name: 'Approval Rules', 
      path: '/approvals', 
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>` 
    },
    { 
      name: 'SCM AI Assistant', 
      path: '/ai-chat', 
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>` 
    },
    { 
      name: 'Settings & Audits', 
      path: '/settings', 
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>` 
    }
  ];

  filteredNavItems = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.navItems.filter(item => {
      const role = user.role;
      if (item.path === '/dashboard' || item.path === '/ai-chat') return true;
      if (item.path === '/procurement') return role === 'SUPER_ADMIN' || role === 'PROCUREMENT_MANAGER';
      if (item.path === '/vendor-portal') return role === 'VENDOR';
      if (item.path === '/inventory') return role === 'SUPER_ADMIN' || role === 'INVENTORY_MANAGER';
      if (item.path === '/warehouse') return role === 'SUPER_ADMIN' || role === 'WAREHOUSE_MANAGER' || role === 'INVENTORY_MANAGER';
      if (item.path === '/orders') return role === 'SUPER_ADMIN' || role === 'LOGISTICS_MANAGER';
      if (item.path === '/logistics') return role === 'SUPER_ADMIN' || role === 'LOGISTICS_MANAGER';
      if (item.path === '/approvals') return role === 'SUPER_ADMIN';
      if (item.path === '/settings') return role === 'SUPER_ADMIN';
      return false;
    });
  });

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  constructor(
    public authService: AuthService,
    public notificationService: NotificationService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    // Automatically fetch route path names
    this.router.events.subscribe(() => {
      const url = this.router.url.split('?')[0].substring(1);
      this.activeRoute.set(url || 'dashboard');
    });

    // Handle dark theme body class toggle via signal effects
    effect(() => {
      if (this.isDarkMode()) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    });

    // Load notifications when user changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.notificationService.loadNotifications();
      }
    });

    // Poll notifications every 30 seconds
    setInterval(() => {
      if (this.authService.currentUser()) {
        this.notificationService.loadNotifications();
      }
    }, 30000);
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(val => !val);
  }

  toggleNotifications() {
    this.notificationsOpen.update(val => !val);
    this.profileOpen.set(false);
  }

  toggleProfile() {
    this.profileOpen.update(val => !val);
    this.notificationsOpen.set(false);
  }

  toggleDarkMode() {
    this.isDarkMode.update(val => !val);
  }

  markNotificationRead(id: number) {
    this.notificationService.markAsRead(id);
  }

  markAllNotificationsRead() {
    this.notificationService.markAllAsRead();
    this.notificationsOpen.set(false);
  }

  onLogout() {
    this.authService.logout();
    this.profileOpen.set(false);
    this.router.navigate(['/login']);
  }
}
