import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-content-scroll bg-[color:var(--bg-primary)]">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[color:var(--text-primary)]">Real-Time Inventory Control</h1>
          <p class="text-xs text-[color:var(--text-secondary)]">Stock ledger, reorder levels, transfers, and barcode scanning systems.</p>
        </div>
      </div>

      <!-- Action Panel & Barcode Scanner Simulator -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Adjust stock quick tools -->
        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] lg:col-span-2">
          <h3 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Stock Ledger Adjustments</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Stock In -->
            <button 
              (click)="openAdjustmentModal('STOCK_IN')"
              class="p-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-left flex flex-col justify-between h-28"
            >
              <span class="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">+</span>
              <span class="text-xs font-bold text-[color:var(--text-primary)] mt-2">Cycle Stock In</span>
            </button>

            <!-- Stock Out -->
            <button 
              (click)="openAdjustmentModal('STOCK_OUT')"
              class="p-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] hover:border-red-500 hover:bg-red-500/5 transition-all text-left flex flex-col justify-between h-28"
            >
              <span class="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-lg">-</span>
              <span class="text-xs font-bold text-[color:var(--text-primary)] mt-2">Deduct / Stock Out</span>
            </button>

            <!-- Transfer -->
            <button 
              (click)="openAdjustmentModal('TRANSFER')"
              class="p-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] hover:border-blue-500 hover:bg-blue-500/5 transition-all text-left flex flex-col justify-between h-28"
            >
              <span class="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg">⇄</span>
              <span class="text-xs font-bold text-[color:var(--text-primary)] mt-2">Bin-to-Bin Transfer</span>
            </button>
          </div>
        </div>

        <!-- Barcode Simulator Card -->
        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <h3 class="text-sm font-bold text-[color:var(--text-primary)] mb-2">Barcode Terminal Simulation</h3>
          <p class="text-[11px] text-[color:var(--text-secondary)] mb-4">Simulate scanning stock package tags to locate parts inside the warehouse bins.</p>
          
          <div class="flex gap-2">
            <input 
              type="text" 
              [(ngModel)]="scanCode"
              class="flex-1 px-3 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
              placeholder="e.g. SKU-MCU-X90"
            >
            <button 
              (click)="simulateScan()"
              class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Scan Tag
            </button>
          </div>

          <div *ngIf="scannedItem()" class="mt-4 p-3.5 rounded-xl border border-blue-500/10 bg-blue-500/5 flex flex-col gap-1 text-xs">
            <span class="font-bold text-[color:var(--text-primary)]">{{ scannedItem().name }}</span>
            <span class="text-[10px] text-[color:var(--text-secondary)]">Bin Location: <strong>{{ scannedItem().bin?.binNumber || 'B01' }}</strong></span>
            <span class="text-[10px] text-[color:var(--text-secondary)]">Available Stock: <strong>{{ scannedItem().quantity }} units</strong></span>
          </div>
        </div>
      </div>

      <!-- INVENTORY LEDGER TABLE -->
      <div class="glass-card bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] overflow-hidden">
        <div class="p-4 border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] flex justify-between items-center">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Sourcing ledger</h4>
          <span class="text-[10px] text-blue-600 font-semibold">Real-Time Refresh Active</span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-[color:var(--border-color)] text-[color:var(--text-secondary)] font-semibold uppercase">
                <th class="p-4">SKU Code</th>
                <th class="p-4">Part Details</th>
                <th class="p-4">Bin Address</th>
                <th class="p-4">Quantity</th>
                <th class="p-4">Reorder point</th>
                <th class="p-4">Tracking Code</th>
                <th class="p-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:var(--border-color)] text-[color:var(--text-primary)]">
              <tr *ngFor="let item of inventory()" class="hover:bg-slate-500/5">
                <td class="p-4 font-bold">{{ item.sku }}</td>
                <td class="p-4 flex flex-col">
                  <span class="font-medium text-sm">{{ item.name }}</span>
                  <span class="text-[10px] text-[color:var(--text-secondary)]">{{ item.description }}</span>
                </td>
                <td class="p-4 font-semibold text-blue-600 dark:text-blue-400">
                  {{ item.bin?.binNumber || 'B01' }} (Rack {{ item.bin?.shelf?.rack?.rackNumber || 'B1' }})
                </td>
                <td class="p-4 font-semibold">{{ item.quantity }}</td>
                <td class="p-4">{{ item.reorderLevel }} units</td>
                <td class="p-4 text-[color:var(--text-secondary)]">{{ item.batchNumber }}</td>
                <td class="p-4">
                  <span class="badge" [ngClass]="{
                    'badge-success': item.status === 'IN_STOCK',
                    'badge-pending': item.status === 'LOW_STOCK',
                    'badge-danger': item.status === 'OUT_OF_STOCK'
                  }">{{ item.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ADJUSTMENT ACTION OVERLAY DIALOG -->
      <div *ngIf="adjustmentModalOpen()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] rounded-2xl shadow-2xl p-6 relative">
          <button (click)="adjustmentModalOpen.set(false)" class="absolute top-4 right-4 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 class="text-lg font-bold text-[color:var(--text-primary)] mb-4 capitalize">
            {{ activeAdjustmentType().replace('_', ' ') }} Workbench
          </h2>

          <form (submit)="applyAdjustment()">
            <div class="space-y-4">
              
              <!-- Item Select -->
              <div>
                <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Select SKU</label>
                <select 
                  name="itemId" 
                  required 
                  [(ngModel)]="adjustmentPayload.inventoryItemId"
                  (ngModelChange)="onItemChange()"
                  class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none"
                >
                  <option *ngFor="let item of inventory()" [value]="item.id">{{ item.sku }} - {{ item.name }}</option>
                </select>
              </div>

              <!-- Quantity Input -->
              <div>
                <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Adjustment Quantity</label>
                <input 
                  type="number" 
                  name="quantity" 
                  required 
                  [(ngModel)]="adjustmentPayload.quantity"
                  class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none"
                  placeholder="50"
                >
              </div>

              <!-- Bin fields based on adjustment type -->
              <div class="grid grid-cols-2 gap-4">
                <div *ngIf="activeAdjustmentType() !== 'STOCK_IN'">
                  <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Source Bin</label>
                  <select 
                    name="sourceBinId"
                    required
                    [(ngModel)]="adjustmentPayload.sourceBinId"
                    class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none"
                  >
                    <option *ngFor="let bin of bins()" [value]="bin.id">{{ bin.id }} (Bin {{ bin.binNumber }})</option>
                  </select>
                </div>
                <div *ngIf="activeAdjustmentType() !== 'STOCK_OUT'">
                  <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Destination Bin</label>
                  <select 
                    name="destinationBinId"
                    required
                    [(ngModel)]="adjustmentPayload.destinationBinId"
                    class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none"
                  >
                    <option *ngFor="let bin of bins()" [value]="bin.id">{{ bin.id }} (Bin {{ bin.binNumber }})</option>
                  </select>
                </div>
              </div>

              <!-- Reference ID -->
              <div *ngIf="activeAdjustmentType() !== 'TRANSFER'">
                <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Reference PO / Order ID</label>
                <input 
                  type="text" 
                  name="referenceId"
                  [(ngModel)]="adjustmentPayload.referenceId"
                  class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none"
                  placeholder="INTERNAL"
                >
              </div>

            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button type="button" (click)="adjustmentModalOpen.set(false)" class="px-4 py-2 rounded-xl border border-[color:var(--border-color)] text-xs font-semibold text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)]">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                Submit Transaction
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class InventoryComponent implements OnInit {
  inventory = signal<any[]>([]);
  bins = signal<any[]>([]);
  scanCode = '';
  scannedItem = signal<any | null>(null);

  adjustmentModalOpen = signal<boolean>(false);
  activeAdjustmentType = signal<string>('STOCK_IN');
  adjustmentPayload = { inventoryItemId: '', quantity: 1, sourceBinId: '', destinationBinId: '', referenceId: 'INTERNAL' };

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadInventory();
    this.loadBins();
  }

  loadInventory() {
    this.apiService.getInventory().subscribe(res => this.inventory.set(res));
  }

  loadBins() {
    this.apiService.getAllBins().subscribe(res => this.bins.set(res));
  }

  simulateScan() {
    const matched = this.inventory().find(i => i.sku.toLowerCase() === this.scanCode.trim().toLowerCase());
    if (matched) {
      this.scannedItem.set(matched);
      this.notificationService.addNotification(
        'Barcode Scanned',
        `Scanned tag: ${matched.sku}. Located in bin ${matched.bin?.binNumber}.`,
        'INFO'
      );
    } else {
      this.scannedItem.set(null);
      this.notificationService.addNotification(
        'Scan Failed',
        `No item matched the tag: ${this.scanCode}`,
        'STOCK_ALERT'
      );
    }
  }

  openAdjustmentModal(type: string) {
    this.activeAdjustmentType.set(type);
    const defaultItem = this.inventory()[0];
    const defaultBinId = defaultItem?.bin?.id || this.bins()[0]?.id || '';
    this.adjustmentPayload = { 
      inventoryItemId: defaultItem?.id || '', 
      quantity: 50, 
      sourceBinId: defaultBinId, 
      destinationBinId: defaultBinId, 
      referenceId: 'INTERNAL' 
    };
    this.adjustmentModalOpen.set(true);
  }

  onItemChange() {
    const selectedItem = this.inventory().find(i => i.id === this.adjustmentPayload.inventoryItemId);
    if (selectedItem) {
      const binId = selectedItem.bin?.id || this.bins()[0]?.id || '';
      this.adjustmentPayload.sourceBinId = binId;
      this.adjustmentPayload.destinationBinId = binId;
    }
  }

  applyAdjustment() {
    const type = this.activeAdjustmentType();
    const p = this.adjustmentPayload;
    
    if (type === 'STOCK_IN') {
      this.apiService.stockIn(p.inventoryItemId, p.quantity, p.destinationBinId, p.referenceId).subscribe(() => {
        this.finishAdjustment('Stock replenishment logged');
      });
    } else if (type === 'STOCK_OUT') {
      this.apiService.stockOut(p.inventoryItemId, p.quantity, p.sourceBinId, p.referenceId).subscribe({
        next: () => this.finishAdjustment('Stock deduction logged'),
        error: (err) => alert(err.message || 'Deduction failed')
      });
    } else if (type === 'TRANSFER') {
      this.apiService.transferStock(p.inventoryItemId, p.quantity, p.sourceBinId, p.destinationBinId).subscribe(() => {
        this.finishAdjustment('Inter-bin stock transfer logged');
      });
    }
  }

  private finishAdjustment(msg: string) {
    this.adjustmentModalOpen.set(false);
    this.loadInventory();
    this.notificationService.addNotification(
      'Stock Transaction',
      `${msg} successfully.`,
      'INFO'
    );
  }
}
