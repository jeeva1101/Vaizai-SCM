import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-vendor-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-content-scroll bg-[color:var(--bg-primary)]">
      
      <!-- Welcome Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[color:var(--text-primary)]">Vendor Center</h1>
          <p class="text-xs text-[color:var(--text-secondary)]">Sourcing dashboard for verified enterprise suppliers.</p>
        </div>
      </div>

      <!-- VENDOR METRICS SCORECARD GRID -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        
        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <p class="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Reliability Rating</p>
          <h3 class="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">95.0%</h3>
          <span class="text-[10px] text-emerald-500 font-semibold mt-1 block">Excellent Rank</span>
        </div>

        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <p class="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Delivery Precision</p>
          <h3 class="text-2xl font-bold mt-1 text-indigo-500">94.5%</h3>
          <span class="text-[10px] text-[color:var(--text-secondary)] mt-1 block">Lead time avg: 4.8 days</span>
        </div>

        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <p class="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Quality Rating</p>
          <h3 class="text-2xl font-bold mt-1 text-emerald-500">96.0%</h3>
          <span class="text-[10px] text-emerald-500 font-semibold mt-1 block">Defect Rate < 0.1%</span>
        </div>

        <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
          <p class="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Pricing Score</p>
          <h3 class="text-2xl font-bold mt-1 text-amber-500">88.0%</h3>
          <span class="text-[10px] text-[color:var(--text-secondary)] mt-1 block">Target margin matches</span>
        </div>

      </div>

      <!-- WORKBENCH PANEL GRIDS -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Column 1 & 2: Active RFQs to Bid On -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-bold text-[color:var(--text-primary)]">Open Requests for Proposals (RFQs)</h3>
          </div>

          <div *ngIf="rfqs().length === 0" class="p-6 glass-card bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-center text-xs text-[color:var(--text-secondary)]">
            No active RFQ sourcing requests at this time.
          </div>

          <div 
            *ngFor="let rfq of rfqs()" 
            class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] border-l-4 border-l-blue-600 space-y-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-bold text-sm text-[color:var(--text-primary)]">{{ rfq.title }}</h4>
                <span class="text-[10px] text-[color:var(--text-secondary)]">RFQ ID: {{ rfq.id }}</span>
              </div>
              <span class="badge badge-info" *ngIf="!submittedBids()[rfq.id]">Bidding Open</span>
              <span class="badge badge-success" *ngIf="submittedBids()[rfq.id]">Bid Submitted</span>
            </div>
            
            <p class="text-xs text-[color:var(--text-secondary)]">{{ rfq.description }}</p>
            
            <!-- Quick Bid Submission form inside layout -->
            <div *ngIf="!submittedBids()[rfq.id]" class="pt-4 border-t border-[color:var(--border-color)] flex flex-wrap gap-4 items-end justify-between">
              <div class="flex gap-4">
                <div>
                  <label class="block text-[10px] uppercase font-bold text-[color:var(--text-secondary)] mb-1">Unit Bid (₹)</label>
                  <input 
                    type="number" 
                    [(ngModel)]="bidPrices[rfq.id]"
                    class="w-24 px-3 py-1.5 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                    placeholder="4.00"
                  >
                </div>
                <div>
                  <label class="block text-[10px] uppercase font-bold text-[color:var(--text-secondary)] mb-1">Lead days</label>
                  <input 
                    type="number" 
                    [(ngModel)]="bidLeads[rfq.id]"
                    class="w-20 px-3 py-1.5 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                    placeholder="5"
                  >
                </div>
              </div>
              
              <button 
                (click)="submitBid(rfq.id)" 
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/10"
              >
                Submit Proposal
              </button>
            </div>

            <!-- Bid Details if submitted -->
            <div *ngIf="submittedBids()[rfq.id]" class="pt-4 border-t border-[color:var(--border-color)] text-xs flex justify-between items-center bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
              <div class="flex gap-4">
                <div>
                  <span class="block text-[9px] uppercase font-bold text-[color:var(--text-secondary)]">Your Unit Bid</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">₹{{ submittedBids()[rfq.id].unitPrice }}</span>
                </div>
                <div>
                  <span class="block text-[9px] uppercase font-bold text-[color:var(--text-secondary)]">Lead Days</span>
                  <span class="font-bold text-[color:var(--text-primary)]">{{ submittedBids()[rfq.id].deliveryLeadDays }} days</span>
                </div>
              </div>
              <div class="text-right">
                <span class="block text-[9px] uppercase font-bold text-[color:var(--text-secondary)]">Bid Status</span>
                <span class="font-bold text-blue-600 dark:text-blue-400">{{ submittedBids()[rfq.id].status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Column 3: Catalog & Invoice upload side elements -->
        <div class="space-y-6">
          <!-- Catalog List -->
          <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <h4 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Supplier Product Catalog</h4>
            
            <div class="space-y-3 mb-4 max-h-56 overflow-y-auto">
              <div *ngFor="let item of catalogItems" class="flex justify-between items-center text-xs p-2.5 rounded-lg bg-[color:var(--bg-tertiary)]">
                <div class="flex flex-col">
                  <span class="font-semibold text-[color:var(--text-primary)]">{{ item.name }}</span>
                  <span class="text-[9px] text-[color:var(--text-secondary)]">{{ item.sku }}</span>
                </div>
                <span class="font-bold text-blue-600 dark:text-blue-400">₹{{ item.price | number:'1.2-2' }}</span>
              </div>
            </div>
            
            <div class="pt-4 border-t border-[color:var(--border-color)]">
              <h5 class="text-xs font-bold text-[color:var(--text-primary)] mb-2">Register Catalog Item</h5>
              <div class="space-y-2.5">
                <input type="text" [(ngModel)]="newCatalogItem.name" class="w-full px-3 py-1.5 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none" placeholder="Item Name">
                <input type="text" [(ngModel)]="newCatalogItem.sku" class="w-full px-3 py-1.5 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none" placeholder="SKU Code">
                <input type="number" [(ngModel)]="newCatalogItem.price" class="w-full px-3 py-1.5 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none" placeholder="Unit Price">
                <button (click)="addCatalogItem()" class="w-full py-2 rounded-lg bg-[color:var(--bg-tertiary)] hover:bg-blue-600 hover:text-white text-xs font-semibold text-[color:var(--text-primary)] transition-colors">
                  Add to Catalog
                </button>
              </div>
            </div>
          </div>

          <!-- Document Invoice simulation -->
          <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <h4 class="text-sm font-bold text-[color:var(--text-primary)] mb-2">e-Invoicing Workbench</h4>
            <p class="text-[11px] text-[color:var(--text-secondary)] mb-4">Upload invoice PDFs against awarded purchase orders for processing.</p>
            
            <input 
              type="file" 
              #fileInput 
              (change)="onFileSelected($event)" 
              accept="application/pdf" 
              class="hidden"
            >

            <div 
              (click)="fileInput.click()"
              class="border-2 border-dashed border-[color:var(--border-color)] rounded-xl p-6 text-center hover:bg-blue-500/5 cursor-pointer transition-colors"
            >
              <svg class="mx-auto h-8 w-8 text-[color:var(--text-secondary)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="text-xs text-[color:var(--text-primary)] font-semibold block">Select Invoice PDF</span>
              <span class="text-[9px] text-[color:var(--text-secondary)] block mt-0.5">Maximum size: 5MB</span>
            </div>

            <!-- Upload progress simulator -->
            <div *ngIf="uploadProgress() > 0" class="mt-4 space-y-1">
              <div class="flex justify-between text-[10px] text-[color:var(--text-secondary)]">
                <span class="truncate max-w-[150px] inline-block">Uploading {{ uploadingFileName() }}...</span>
                <span>{{ uploadProgress() }}%</span>
              </div>
              <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div class="h-full bg-blue-600 transition-all duration-75" [style.width.%]="uploadProgress()"></div>
              </div>
            </div>

            <!-- Invoices List -->
            <div class="mt-6 pt-4 border-t border-[color:var(--border-color)]">
              <h5 class="text-xs font-bold text-[color:var(--text-primary)] mb-3">Recent Uploaded Invoices</h5>
              <div *ngIf="invoices().length === 0" class="text-center text-[10px] text-[color:var(--text-secondary)] py-2">
                No invoices uploaded yet.
              </div>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div *ngFor="let inv of invoices()" class="p-2.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] flex justify-between items-center text-[10px]">
                  <div class="flex flex-col gap-0.5 overflow-hidden pr-2 text-left">
                    <span class="font-bold text-[color:var(--text-primary)] truncate" [title]="inv.fileName">{{ inv.fileName }}</span>
                    <span class="text-[8px] text-[color:var(--text-secondary)]">ID: {{ inv.id }} | PO: {{ inv.poId }}</span>
                  </div>
                  <div class="flex flex-col items-end gap-1 shrink-0">
                    <span class="font-semibold text-blue-600 dark:text-blue-400">₹{{ inv.amount | number }}</span>
                    <span class="badge py-0.5 px-1.5 text-[8px]" [ngClass]="{
                      'badge-success': inv.status === 'PAID',
                      'badge-pending': inv.status === 'PENDING_REVIEW'
                    }">{{ inv.status.replace('_', ' ') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class VendorPortalComponent implements OnInit {
  rfqs = signal<any[]>([]);
  bidPrices: { [key: string]: number } = {};
  bidLeads: { [key: string]: number } = {};
  submittedBids = signal<{ [key: string]: any }>({});
  vendorProfile = signal<any | null>(null);
  invoices = signal<any[]>([]);
  uploadProgress = signal<number>(0);
  uploadingFileName = signal<string>('');

  catalogItems = [
    { name: 'Microcontroller Unit MCU-X90', sku: 'SKU-MCU-X90', price: 4.20 },
    { name: 'Fiber Cable Cat6', sku: 'SKU-FIB-CAT6', price: 110.00 },
    { name: 'Temp Sensor Pro', sku: 'SKU-TMP-SEN0', price: 23.50 }
  ];

  newCatalogItem = { name: '', sku: '', price: 0.0 };

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadVendorProfile();
    this.loadRfqs();
    this.loadMyQuotations();
  }

  loadVendorProfile() {
    this.apiService.getVendorProfile().subscribe({
      next: (profile) => this.vendorProfile.set(profile),
      error: (err) => console.warn('Vendor profile not found (non-vendor user)', err)
    });
  }

  loadRfqs() {
    // Use vendor-scoped endpoint for VENDOR role, or general RFQs for admins
    this.apiService.getVendorRfqs().subscribe({
      next: (res) => {
        this.rfqs.set(res);
        res.forEach(r => {
          this.bidPrices[r.id] = 4.20;
          this.bidLeads[r.id] = 5;

          // Fetch quotations to check if already submitted
          this.apiService.getQuotations(r.id).subscribe(quotes => {
            const vendorId = this.vendorProfile()?.id;
            const myQuote = quotes.find(q => 
              vendorId ? (q.vendor?.id === vendorId) : true
            );
            if (myQuote) {
              this.submittedBids.update(prev => ({
                ...prev,
                [r.id]: myQuote
              }));
            }
          });
        });
      },
      error: (err) => {
        // Fallback for non-vendor roles viewing portal
        this.apiService.getRfqs().subscribe(res => {
          const openRfqs = res.filter(r => r.status === 'OPEN');
          this.rfqs.set(openRfqs);
        });
      }
    });
  }

  loadMyQuotations() {
    this.apiService.getVendorQuotations().subscribe({
      next: (quotes) => {
        // Build submitted bids map from existing quotations
        quotes.forEach((q: any) => {
          if (q.rfq?.id) {
            this.submittedBids.update(prev => ({
              ...prev,
              [q.rfq.id]: q
            }));
          }
        });
      },
      error: () => {} // Non-critical
    });
  }

  submitBid(rfqId: string) {
    const price = this.bidPrices[rfqId];
    const lead = this.bidLeads[rfqId];
    const vendorId = this.vendorProfile()?.id || 'VEN-001';
    
    this.apiService.submitQuotation(rfqId, vendorId, price, lead, 'Sourcing from premium supply stocks.').subscribe({
      next: () => {
        this.notificationService.addNotification(
          'Proposal Submitted',
          `Supplier bid of ₹${price} per unit submitted against RFQ ${rfqId}.`,
          'INFO'
        );
        this.loadRfqs();
        this.loadMyQuotations();
      },
      error: (err) => {
        alert('Failed to submit bid: ' + (err.error?.error || err.message));
      }
    });
  }

  addCatalogItem() {
    if (this.newCatalogItem.name && this.newCatalogItem.sku) {
      this.catalogItems.push({ ...this.newCatalogItem });
      this.newCatalogItem = { name: '', sku: '', price: 0.0 };
      this.notificationService.addNotification(
        'Catalog Updated',
        'New catalog item has been catalogued for procurement.',
        'INFO'
      );
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.uploadingFileName.set(file.name);
      this.uploadProgress.set(5);
      
      const interval = setInterval(() => {
        this.uploadProgress.update(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              // Add mock invoice to recent list
              const newInvoice = {
                id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
                poId: 'PO-' + Math.floor(100 + Math.random() * 900),
                fileName: file.name,
                amount: Math.floor(2000 + Math.random() * 8000),
                status: 'PENDING_REVIEW',
                date: new Date().toISOString()
              };
              this.invoices.update(prevList => [newInvoice, ...prevList]);
              this.uploadProgress.set(0);
              this.uploadingFileName.set('');
              
              this.notificationService.addNotification(
                'e-Invoice Uploaded',
                `Invoice ${newInvoice.id} uploaded successfully against ${newInvoice.poId}.`,
                'INFO'
              );
            }, 300);
            return 100;
          }
          return prev + 15;
        });
      }, 100);
    }
  }
}
