import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-content-scroll bg-[color:var(--bg-primary)]">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[color:var(--text-primary)]">Procurement Workbench</h1>
          <p class="text-xs text-[color:var(--text-secondary)]">Automate purchase requests, manage RFQs, award quotations, and track vendor purchase orders.</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-[color:var(--border-color)] mb-6 overflow-x-auto">
        <button 
          *ngFor="let tab of tabs" 
          (click)="activeTab.set(tab.id)"
          class="px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors"
          [class.border-blue-600]="activeTab() === tab.id"
          [class.text-blue-600]="activeTab() === tab.id"
          [class.border-transparent]="activeTab() !== tab.id"
          [class.text-[color:var(--text-secondary)]]="activeTab() !== tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- TAB 1: PURCHASE REQUESTS -->
      <div *ngIf="activeTab() === 'prs'" class="space-y-6">
        
        <!-- Action bar -->
        <div class="flex justify-between items-center">
          <h3 class="text-sm font-bold text-[color:var(--text-primary)]">Requisition Ledger</h3>
          <button (click)="openCreatePrModal()" class="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10">
            + New Request
          </button>
        </div>

        <!-- PR Table Grid -->
        <div class="glass-card bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] font-semibold uppercase">
                  <th class="p-4">Request ID</th>
                  <th class="p-4">Item Details</th>
                  <th class="p-4">Qty</th>
                  <th class="p-4">Estimated Cost</th>
                  <th class="p-4">Approval level</th>
                  <th class="p-4">Status</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:var(--border-color)] text-[color:var(--text-primary)]">
                <tr *ngFor="let pr of prs()" class="hover:bg-slate-500/5">
                  <td class="p-4 font-bold">{{ pr.id }}</td>
                  <td class="p-4 flex flex-col">
                    <span class="font-medium text-sm">{{ pr.itemName }}</span>
                    <span class="text-[10px] text-[color:var(--text-secondary)]">{{ pr.description }}</span>
                  </td>
                  <td class="p-4">{{ pr.quantity }}</td>
                  <td class="p-4 font-semibold">₹{{ pr.estimatedCost | number:'1.2-2' }}</td>
                  <td class="p-4">Level {{ pr.approvalLevel }}</td>
                  <td class="p-4">
                    <span class="badge" [ngClass]="{
                      'badge-pending': pr.status === 'PENDING_APPROVAL',
                      'badge-success': pr.status === 'APPROVED' || pr.status === 'ORDERED',
                      'badge-info': pr.status === 'RFQ_STAGE'
                    }">{{ pr.status }}</span>
                  </td>
                  <td class="p-4 text-right">
                    <button 
                      *ngIf="pr.status === 'PENDING_APPROVAL' && authService.hasRole(['SUPER_ADMIN', 'PROCUREMENT_MANAGER'])"
                      (click)="approvePr(pr.id)"
                      class="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-[10px] transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      *ngIf="pr.status === 'PENDING_APPROVAL' || pr.status === 'DRAFT'"
                      (click)="deletePr(pr.id)"
                      class="ml-1.5 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-[10px] transition-colors"
                    >
                      Delete
                    </button>
                    <button 
                      *ngIf="pr.status === 'APPROVED'"
                      (click)="createRfqFromPr(pr)"
                      class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[10px] transition-colors"
                    >
                      Launch RFQ
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: RFQ WORKBENCH -->
      <div *ngIf="activeTab() === 'rfqs'" class="space-y-6">
        <h3 class="text-sm font-bold text-[color:var(--text-primary)]">Request For Quotation (RFQ) Campaigns</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            *ngFor="let rfq of rfqs()" 
            class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] flex flex-col justify-between"
          >
            <div>
              <div class="flex justify-between items-center mb-4">
                <span class="font-bold text-xs text-blue-600 dark:text-blue-400">{{ rfq.id }}</span>
                <span class="badge badge-info">{{ rfq.status }}</span>
              </div>
              <h4 class="text-base font-bold mb-2">{{ rfq.title }}</h4>
              <p class="text-xs text-[color:var(--text-secondary)] mb-4">{{ rfq.description }}</p>
              
              <div class="text-[11px] space-y-1 mb-6 text-[color:var(--text-secondary)]">
                <p><strong>Associated PR</strong>: {{ rfq.purchaseRequestId }}</p>
                <p><strong>Response Deadline</strong>: {{ rfq.deadline | date:'medium' }}</p>
              </div>
            </div>

            <button 
              (click)="viewBids(rfq.id)" 
              class="w-full py-2 bg-[color:var(--bg-tertiary)] hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold text-[color:var(--text-primary)] transition-all flex items-center justify-center gap-1.5"
            >
              Inspect Vendor Bids
              <span class="h-4 w-4 rounded-full bg-blue-500/20 text-[9px] flex items-center justify-center font-bold">Q</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 3: VENDOR BIDS COMPARISON -->
      <div *ngIf="activeTab() === 'bids'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-sm font-bold text-[color:var(--text-primary)]">Bid Quotation Analysis</h3>
          <button (click)="activeTab.set('rfqs')" class="text-xs text-blue-600 font-semibold flex items-center gap-1">
            ← Back to RFQs
          </button>
        </div>

        <div *ngIf="selectedRfqId()" class="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 mb-4 text-xs">
          Comparing quotations submitted for RFQ Campaign: <strong>{{ selectedRfqId() }}</strong>
        </div>

        <!-- Bids side-by-side matrices -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngIf="currentQuotations().length === 0" class="p-6 text-center text-xs text-[color:var(--text-secondary)] col-span-3">
            No bids submitted yet for this RFQ campaign. Use the Vendor Portal to submit.
          </div>
          
          <div 
            *ngFor="let q of currentQuotations()" 
            class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] flex flex-col justify-between"
            [class.border-blue-500]="q.status === 'ACCEPTED'"
          >
            <div>
              <div class="flex justify-between items-center mb-4">
                <span class="text-[10px] text-[color:var(--text-secondary)]">ID: {{ q.id }}</span>
                <span class="badge" [ngClass]="{
                  'badge-pending': q.status === 'SUBMITTED',
                  'badge-success': q.status === 'ACCEPTED'
                }">{{ q.status }}</span>
              </div>
              <h4 class="font-bold text-sm text-[color:var(--text-primary)] mb-1">{{ q.vendorName }}</h4>
              <p class="text-[11px] text-[color:var(--text-secondary)] mb-4">Lead Time: <strong>{{ q.deliveryLeadDays }} days</strong></p>
              
              <div class="p-4 rounded-lg bg-[color:var(--bg-tertiary)] mb-4 flex justify-between items-center">
                <span class="text-xs text-[color:var(--text-secondary)]">Total Quote:</span>
                <span class="text-lg font-bold text-blue-600 dark:text-blue-400">₹{{ q.totalPrice | number:'1.2-2' }}</span>
              </div>
              
              <p class="text-[11px] text-[color:var(--text-secondary)] italic mb-6">"{{ q.remarks }}"</p>
            </div>

            <button 
              *ngIf="q.status === 'SUBMITTED'"
              (click)="selectBid(q.id)"
              class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-500/10"
            >
              Award Contract & Generate PO
            </button>
            <div *ngIf="q.status === 'ACCEPTED'" class="py-2 text-center text-xs font-bold text-emerald-500 bg-emerald-500/10 rounded-lg">
              CONTRACT AWARDED
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: PURCHASE ORDERS -->
      <div *ngIf="activeTab() === 'pos'" class="space-y-6">
        <h3 class="text-sm font-bold text-[color:var(--text-primary)]">Dispatched Purchase Orders (POs)</h3>

        <div class="glass-card bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] font-semibold uppercase">
                  <th class="p-4">PO Number</th>
                  <th class="p-4">Vendor</th>
                  <th class="p-4">Items / Details</th>
                  <th class="p-4">Order Value</th>
                  <th class="p-4">Delivery Due</th>
                  <th class="p-4">Status</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:var(--border-color)] text-[color:var(--text-primary)]">
                <tr *ngFor="let po of pos()" class="hover:bg-slate-500/5">
                  <td class="p-4 font-bold">{{ po.id }}</td>
                  <td class="p-4 font-medium">{{ po.vendor?.companyName || 'Apex Suppliers' }}</td>
                  <td class="p-4">{{ po.purchaseRequest?.itemName }} (x{{ po.purchaseRequest?.quantity }})</td>
                  <td class="p-4 font-semibold">₹{{ po.totalAmount | number:'1.2-2' }}</td>
                  <td class="p-4 text-[color:var(--text-secondary)]">{{ po.deliveryDate | date:'mediumDate' }}</td>
                  <td class="p-4">
                    <span class="badge" [ngClass]="{
                      'badge-pending': po.status === 'PENDING_ACCEPTANCE',
                      'badge-success': po.status === 'ACCEPTED' || po.status === 'RECEIVED',
                      'badge-info': po.status === 'SHIPPED'
                    }">{{ po.status }}</span>
                  </td>
                  <td class="p-4 text-right">
                    <button 
                      *ngIf="po.status === 'PENDING_ACCEPTANCE'"
                      (click)="acceptPo(po.id)"
                      class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[10px] transition-colors"
                    >
                      Accept PO
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- CREATE PR MODAL/FORM (OVERLAY) -->
      <div *ngIf="prModalOpen()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-lg bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] rounded-2xl shadow-2xl p-6 relative">
          <button (click)="prModalOpen.set(false)" class="absolute top-4 right-4 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 class="text-lg font-bold text-[color:var(--text-primary)] mb-4">Draft Requisition</h2>
          
          <form (submit)="submitPr()">
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Item Title</label>
                <input 
                  type="text" 
                  name="itemName" 
                  required 
                  [(ngModel)]="newPr.itemName"
                  class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Fiber spools CAT6"
                >
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Quantity</label>
                  <input 
                    type="number" 
                    name="quantity" 
                    required 
                    [(ngModel)]="newPr.quantity"
                    class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:border-blue-500"
                    placeholder="100"
                  >
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Estimated Cost (₹)</label>
                  <input 
                    type="number" 
                    name="estimatedCost" 
                    required 
                    [(ngModel)]="newPr.estimatedCost"
                    class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:border-blue-500"
                    placeholder="50000"
                  >
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1">Justification / Remarks</label>
                <textarea 
                  name="description" 
                  [(ngModel)]="newPr.description"
                  class="w-full px-4 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:border-blue-500 h-24"
                  placeholder="Details justifying procurement needs..."
                ></textarea>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button type="button" (click)="prModalOpen.set(false)" class="px-4 py-2 rounded-xl border border-[color:var(--border-color)] text-xs font-semibold text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)]">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                Submit for Approval
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class ProcurementComponent implements OnInit {
  activeTab = signal<string>('prs');
  prs = signal<any[]>([]);
  rfqs = signal<any[]>([]);
  pos = signal<any[]>([]);
  currentQuotations = signal<any[]>([]);
  selectedRfqId = signal<string | null>(null);

  prModalOpen = signal<boolean>(false);
  newPr = { itemName: '', quantity: 100, estimatedCost: 10000, description: '' };

  tabs = [
    { id: 'prs', name: 'Purchase Requests' },
    { id: 'rfqs', name: 'RFQ Campaigns' },
    { id: 'bids', name: 'Compare Bids' },
    { id: 'pos', name: 'Purchase Orders' }
  ];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getPurchaseRequests().subscribe(res => this.prs.set(res));
    this.apiService.getRfqs().subscribe(res => this.rfqs.set(res));
    this.apiService.getPurchaseOrders().subscribe(res => this.pos.set(res));
  }

  openCreatePrModal() {
    this.newPr = { itemName: '', quantity: 100, estimatedCost: 10000, description: '' };
    this.prModalOpen.set(true);
  }

  submitPr() {
    this.apiService.createPurchaseRequest(this.newPr).subscribe(() => {
      this.prModalOpen.set(false);
      this.loadData();
      this.notificationService.addNotification(
        'Requisition Logged',
        `Requisition logged for: ${this.newPr.itemName} (x${this.newPr.quantity})`,
        'INFO'
      );
    });
  }

  approvePr(prId: string) {
    this.apiService.approvePurchaseRequest(prId, 'Approved under auth level 1').subscribe(() => {
      this.loadData();
      this.notificationService.addNotification(
        'Requisition Approved',
        `Requisition ${prId} approved. Launch RFQ configuration.`,
        'INFO'
      );
    });
  }

  deletePr(prId: string) {
    if (confirm('Are you sure you want to delete this purchase request?')) {
      this.apiService.deleteRequest(prId).subscribe(() => {
        this.loadData();
        this.notificationService.addNotification(
          'Requisition Deleted',
          `Purchase request ${prId} was deleted.`,
          'INFO'
        );
      });
    }
  }

  createRfqFromPr(pr: any) {
    const deadline = new Date(Date.now() + 86400000 * 7).toISOString().substring(0, 16);
    this.apiService.createRfq(
      pr.id, 
      `RFQ for ${pr.itemName}`, 
      `Bidding campaign for sourcing ${pr.quantity} units of ${pr.itemName}.`, 
      deadline
    ).subscribe(() => {
      this.loadData();
      this.activeTab.set('rfqs');
      this.notificationService.addNotification(
        'RFQ Campaign Sourced',
        `RFQ campaign initiated for: ${pr.itemName}`,
        'INFO'
      );
    });
  }

  viewBids(rfqId: string) {
    this.selectedRfqId.set(rfqId);
    this.apiService.getQuotations(rfqId).subscribe(res => {
      this.currentQuotations.set(res);
      this.activeTab.set('bids');
    });
  }

  selectBid(quoteId: string) {
    this.apiService.selectQuotation(quoteId).subscribe(() => {
      this.loadData();
      this.activeTab.set('pos');
      this.notificationService.addNotification(
        'Quotation Awarded',
        `Quotation selected. SCM Purchase Order created.`,
        'INFO'
      );
    });
  }

  acceptPo(poId: string) {
    this.apiService.acceptPurchaseOrder(poId).subscribe(() => {
      this.loadData();
      this.notificationService.addNotification(
        'Purchase Order Accepted',
        `Purchase Order ${poId} accepted successfully.`,
        'INFO'
      );
    });
  }
}
