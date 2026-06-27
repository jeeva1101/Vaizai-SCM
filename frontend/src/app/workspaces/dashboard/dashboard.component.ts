import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="main-content-scroll bg-[color:var(--bg-primary)]">
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[color:var(--text-primary)]">{{ getDashboardTitle() }}</h1>
          <p class="text-xs text-[color:var(--text-secondary)]">Real-time SCM operations, budgets, and predictive AI insights.</p>
        </div>
        <div class="flex gap-2">
          <button (click)="refreshData()" class="px-4 py-2 text-xs font-semibold rounded-lg bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)] transition-colors flex items-center gap-1.5 shadow-sm">
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
            </svg>
            Sync Data
          </button>
        </div>
      </div>

      <!-- KPI CARD GRID -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <!-- Revenue Card -->
        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">SCM Revenue</p>
              <h3 class="text-2xl font-bold mt-1">₹{{ (summary()?.revenue || 0) | number:'1.2-2' }}</h3>
            </div>
            <div class="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="flex items-center gap-1 text-[11px]">
            <span class="text-emerald-500 font-bold">Real-time</span>
            <span class="text-[color:var(--text-secondary)]">customer fulfillment flow</span>
          </div>
        </div>

        <!-- Spend Card -->
        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Procurement Spend</p>
              <h3 class="text-2xl font-bold mt-1">₹{{ (summary()?.spend || 0) | number:'1.2-2' }}</h3>
            </div>
            <div class="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="flex items-center gap-1 text-[11px]">
            <span class="text-blue-500 font-bold">Optimized</span>
            <span class="text-[color:var(--text-secondary)]">approved vendor billing</span>
          </div>
        </div>

        <!-- Active Orders Card -->
        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Active Shipments</p>
              <h3 class="text-2xl font-bold mt-1">{{ summary()?.activeOrders || 0 }}</h3>
            </div>
            <div class="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
          <div class="flex items-center gap-1 text-[11px]">
            <span class="text-indigo-500 font-bold">Fulfillment Tracking</span>
            <span class="text-[color:var(--text-secondary)]">active order statuses</span>
          </div>
        </div>

        <!-- Low Stock Card -->
        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Reorder Alerts</p>
              <h3 class="text-2xl font-bold mt-1 text-red-500">{{ summary()?.lowStockCount || 0 }} SKU</h3>
            </div>
            <div class="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div class="flex items-center gap-1 text-[11px]">
            <span class="text-red-500 font-bold">Needs Attention</span>
            <span class="text-[color:var(--text-secondary)]">below reorder level</span>
          </div>
        </div>

      </div>

      <!-- CHARTS SECTION -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- Spend and Revenue Chart -->
        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] lg:col-span-2">
          <h4 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Financial Flow Summary (FY 2026)</h4>
          <apx-chart
            *ngIf="chartOptions"
            [series]="chartOptions.series"
            [chart]="chartOptions.chart"
            [xaxis]="chartOptions.xaxis"
            [colors]="chartOptions.colors"
            [dataLabels]="chartOptions.dataLabels"
            [stroke]="chartOptions.stroke"
          ></apx-chart>
        </div>

        <!-- Warehouse Capacity utilization Donut -->
        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <h4 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Storage Volume Capacity</h4>
          <apx-chart
            *ngIf="donutOptions"
            [series]="donutOptions.series"
            [chart]="donutOptions.chart"
            [labels]="donutOptions.labels"
            [colors]="donutOptions.colors"
          ></apx-chart>
          
          <div class="mt-4 space-y-2">
            <div class="flex justify-between items-center text-xs">
              <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-blue-600"></span>PDC Dallas</span>
              <span class="font-bold">4.5% Used (450/10k m³)</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>Cold Storage</span>
              <span class="font-bold">2.4% Used (120/5k m³)</span>
            </div>
          </div>
        </div>

      </div>

      <!-- AI RECOMMENDATIONS & ANOMALY LIST -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- AI SCM Recommendations -->
        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <h4 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">AI SCM Optimization Insights</h4>
          <div class="space-y-4">
            <div 
              *ngFor="let rec of summary()?.aiRecommendations" 
              class="p-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] flex gap-3.5"
            >
              <div class="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center" [ngClass]="{
                'bg-red-500/10 text-red-500': rec.type === 'SECURITY',
                'bg-amber-500/10 text-amber-500': rec.type === 'ALERT',
                'bg-emerald-500/10 text-emerald-500': rec.type === 'SAVING'
              }">
                <span class="font-bold text-xs">{{ rec.type.substring(0, 2) }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-bold text-[color:var(--text-primary)]">{{ rec.title }}</span>
                <span class="text-[11px] text-[color:var(--text-secondary)]">{{ rec.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Anomaly Detection alerts -->
        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-sm font-bold text-[color:var(--text-primary)]">Inventory Audit Variances</h4>
            <span class="badge badge-danger">AI Isolation Forest</span>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-[color:var(--border-color)] text-[color:var(--text-secondary)]">
                  <th class="py-2.5">SKU / Item</th>
                  <th>Quantity</th>
                  <th>Anomaly Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:var(--border-color)] text-[color:var(--text-primary)]">
                <tr *ngFor="let anomaly of summary()?.anomalies" class="hover:bg-slate-500/5">
                  <td class="py-3 flex flex-col">
                    <span class="font-medium">{{ anomaly.itemName }}</span>
                    <span class="text-[10px] text-[color:var(--text-secondary)]">{{ anomaly.sku }}</span>
                  </td>
                  <td>{{ anomaly.quantity }} units</td>
                  <td class="font-bold" [ngClass]="{
                    'text-red-500': anomaly.anomalyScore >= 0.7,
                    'text-amber-500': anomaly.anomalyScore < 0.7
                  }">
                    {{ anomaly.anomalyScore * 100 }}%
                  </td>
                  <td>
                    <span class="badge badge-pending">INVESTIGATING</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  summary = signal<any>(null);
  chartOptions: any;
  donutOptions: any;
  private intervalId: any;

  constructor(private apiService: ApiService, public authService: AuthService) {}

  ngOnInit() {
    this.refreshData();
    // Auto-refresh every 30 seconds
    this.intervalId = setInterval(() => {
      this.refreshData();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getDashboardTitle(): string {
    const role = this.authService.currentUser()?.role;
    if (role === 'PROCUREMENT_MANAGER') return 'Procurement Hub';
    if (role === 'INVENTORY_MANAGER' || role === 'WAREHOUSE_MANAGER') return 'Operations Hub';
    if (role === 'LOGISTICS_MANAGER') return 'Fleet Hub';
    if (role === 'VENDOR') return 'Vendor Dashboard';
    return 'Executive Control Center';
  }

  refreshData() {
    const role = this.authService.currentUser()?.role;
    this.apiService.getDashboardSummary(role).subscribe({
      next: (res) => {
        this.summary.set(res);
        this.initCharts(res);
      },
      error: (err) => console.error('Dashboard synchronization failed', err)
    });
  }

  initCharts(data: any) {
    const revenueVal = data?.revenue || 0;
    const spendVal = data?.spend || 0;

    this.chartOptions = {
      series: [
        {
          name: 'Revenue Flow',
          data: [120000, 185000, 240000, 310000, 380000, revenueVal]
        },
        {
          name: 'Spend flow',
          data: [95000, 110000, 134000, 180000, 210000, spendVal]
        }
      ],
      chart: {
        type: 'area',
        height: 250,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      },
      colors: ['#10b981', '#2563eb'],
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 2.5
      }
    };

    this.donutOptions = {
      series: [450, 120, 13430], // Dallas, Chicago, Free space
      chart: {
        type: 'donut',
        height: 230
      },
      labels: ['PDC Dallas', 'Cold Storage Hub', 'Available space'],
      colors: ['#2563eb', '#22d3ee', '#e2e8f0']
    };
  }
}
