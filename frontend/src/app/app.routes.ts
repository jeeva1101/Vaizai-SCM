import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./workspaces/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./workspaces/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'procurement',
        loadComponent: () => import('./workspaces/procurement/procurement.component').then(m => m.ProcurementComponent),
        canActivate: [authGuard],
        data: { expectedRoles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER'] }
      },
      {
        path: 'vendor-portal',
        loadComponent: () => import('./workspaces/vendor-portal/vendor-portal.component').then(m => m.VendorPortalComponent),
        canActivate: [authGuard],
        data: { expectedRoles: ['VENDOR'] }
      },
      {
        path: 'inventory',
        loadComponent: () => import('./workspaces/inventory/inventory.component').then(m => m.InventoryComponent),
        canActivate: [authGuard],
        data: { expectedRoles: ['SUPER_ADMIN', 'INVENTORY_MANAGER'] }
      },
      {
        path: 'warehouse',
        loadComponent: () => import('./workspaces/warehouse/warehouse.component').then(m => m.WarehouseComponent),
        canActivate: [authGuard],
        data: { expectedRoles: ['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_MANAGER'] }
      },
      {
        path: 'orders',
        loadComponent: () => import('./workspaces/orders/orders.component').then(m => m.OrdersComponent),
        canActivate: [authGuard],
        data: { expectedRoles: ['SUPER_ADMIN', 'LOGISTICS_MANAGER'] }
      },
      {
        path: 'logistics',
        loadComponent: () => import('./workspaces/logistics/logistics.component').then(m => m.LogisticsComponent),
        canActivate: [authGuard],
        data: { expectedRoles: ['SUPER_ADMIN', 'LOGISTICS_MANAGER'] }
      },
      {
        path: 'approvals',
        loadComponent: () => import('./workspaces/workflow-builder/workflow-builder.component').then(m => m.WorkflowBuilderComponent),
        canActivate: [authGuard],
        data: { expectedRoles: ['SUPER_ADMIN'] }
      },
      {
        path: 'ai-chat',
        loadComponent: () => import('./workspaces/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent),
        canActivate: [authGuard]
      },
      {
        path: 'settings',
        loadComponent: () => import('./workspaces/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [authGuard],
        data: { expectedRoles: ['SUPER_ADMIN'] }
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
