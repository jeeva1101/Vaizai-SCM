import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-content-scroll bg-[color:var(--bg-primary)]">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[color:var(--text-primary)]">Customer Orders & Fulfillment</h1>
          <p class="text-xs text-[color:var(--text-secondary)]">Manage client sales contracts, reserve stock inventory, and process invoices.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left 2 Cols: Orders Ledger -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-bold text-[color:var(--text-primary)]">Sales Contract Ledger</h3>
          </div>

          <div class="glass-card bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] font-semibold uppercase">
                    <th class="p-4">Contract ID</th>
                    <th class="p-4">Client Name</th>
                    <th class="p-4">Email</th>
                    <th class="p-4">Total Amount</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-right">Invoices</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[color:var(--border-color)] text-[color:var(--text-primary)]">
                  <tr *ngFor="let order of orders()" class="hover:bg-slate-500/5">
                    <td class="p-4 font-bold">{{ order.id }}</td>
                    <td class="p-4 font-medium">{{ order.customerName }}</td>
                    <td class="p-4 text-[color:var(--text-secondary)]">{{ order.customerEmail }}</td>
                    <td class="p-4 font-semibold">₹{{ order.totalAmount | number:'1.2-2' }}</td>
                    <td class="p-4">
                      <span class="badge" [ngClass]="{
                        'badge-pending': order.status === 'PENDING',
                        'badge-success': order.status === 'APPROVED' || order.status === 'DELIVERED',
                        'badge-info': order.status === 'SHIPPED' || order.status === 'PROCESSING'
                      }">{{ order.status }}</span>
                    </td>
                    <td class="p-4 text-right">
                      <button 
                        (click)="downloadInvoice(order)"
                        class="px-2.5 py-1.5 border border-[color:var(--border-color)] rounded-lg font-semibold text-[10px] hover:bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)] transition-colors"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Col: Create Client Order (Checkout Drawer) -->
        <div class="space-y-6">
          <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <h3 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Create Sales Order</h3>
            
            <form (submit)="submitOrder()">
              <div class="space-y-4">
                
                <div>
                  <label class="block text-[10px] uppercase font-bold text-[color:var(--text-secondary)] mb-1">Customer Name</label>
                  <input 
                    type="text" 
                    name="clientName"
                    required 
                    [(ngModel)]="newOrder.customerName"
                    class="w-full px-3 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                    placeholder="Acme Sourcing"
                  >
                </div>

                <div>
                  <label class="block text-[10px] uppercase font-bold text-[color:var(--text-secondary)] mb-1">Customer Email</label>
                  <input 
                    type="email" 
                    name="clientEmail"
                    required 
                    [(ngModel)]="newOrder.customerEmail"
                    class="w-full px-3 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                    placeholder="sales@acme.com"
                  >
                </div>

                <!-- Select part and quantity -->
                <div class="pt-4 border-t border-[color:var(--border-color)]">
                  <h5 class="text-[11px] font-bold text-[color:var(--text-primary)] mb-2">Order Items</h5>
                  
                  <div class="space-y-3">
                    <div>
                      <label class="block text-[9px] uppercase font-bold text-[color:var(--text-secondary)] mb-1">Product SKU</label>
                      <select 
                        name="skuSelect"
                        [(ngModel)]="orderItemPayload.inventoryItemId"
                        class="w-full px-3 py-1.5 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                      >
                        <option *ngFor="let item of inventoryItems()" [value]="item.id">{{ item.sku }} - {{ item.name }} (Stock: {{ item.quantity }})</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-[9px] uppercase font-bold text-[color:var(--text-secondary)] mb-1">Order Quantity</label>
                      <input 
                        type="number" 
                        name="skuQty"
                        required 
                        [(ngModel)]="orderItemPayload.quantity"
                        class="w-full px-3 py-1.5 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                        placeholder="10"
                      >
                    </div>
                  </div>
                </div>

                <div class="p-3 rounded-lg bg-[color:var(--bg-tertiary)] text-[10px] text-[color:var(--text-secondary)]">
                  Fulfilling the sales order reserves warehouse quantities and spawns logistics milestoning.
                </div>

                <button 
                  type="submit"
                  class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/10"
                >
                  Authorize Checkout
                </button>

              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  inventoryItems = signal<any[]>([]);

  newOrder = { customerName: '', customerEmail: '', items: [] as any[] };
  orderItemPayload = { inventoryItemId: '', quantity: 10 };

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getOrders().subscribe(res => this.orders.set(res));
    this.apiService.getInventory().subscribe(res => {
      this.inventoryItems.set(res);
      if (res.length > 0) {
        this.orderItemPayload.inventoryItemId = res[0].id;
      }
    });
  }

  submitOrder() {
    if (this.newOrder.customerName && this.newOrder.customerEmail) {
      // Package payload items array
      const itemsPayload = [{
        inventoryItemId: this.orderItemPayload.inventoryItemId,
        quantity: this.orderItemPayload.quantity
      }];
      
      const checkoutPayload = {
        customerName: this.newOrder.customerName,
        customerEmail: this.newOrder.customerEmail,
        items: itemsPayload
      };

      this.apiService.createOrder(checkoutPayload).subscribe(() => {
        this.loadData();
        this.newOrder = { customerName: '', customerEmail: '', items: [] };
        this.notificationService.addNotification(
          'Sales Order Approved',
          'Customer order processed. Stock levels reserved. Shipment timeline scheduled.',
          'INFO'
        );
      });
    }
  }

  downloadInvoice(order: any) {
    this.notificationService.addNotification(
      'Invoice Downloaded',
      `Commercial Invoice PDF printed for contract ${order.id}.`,
      'INFO'
    );
    alert(`Generated Invoice PDF parameters:\nContract: ${order.id}\nClient: ${order.customerName}\nOrder Total: ₹${order.totalAmount}\nInvoice status: PAID`);
  }
}
