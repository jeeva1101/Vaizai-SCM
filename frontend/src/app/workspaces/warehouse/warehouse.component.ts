import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-warehouse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-content-scroll bg-[color:var(--bg-primary)]">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[color:var(--text-primary)]">Warehouse Management</h1>
          <p class="text-xs text-[color:var(--text-secondary)]">Manage bin allocations, coordinate putaways, and inspect capacity heatmaps.</p>
        </div>
      </div>

      <!-- WAREHOUSE SELECTOR -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          *ngFor="let wh of warehouses()" 
          (click)="selectWarehouse(wh.id)"
          class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] cursor-pointer transition-all"
          [class.border-blue-600]="selectedWarehouseId() === wh.id"
          [class.ring-2]="selectedWarehouseId() === wh.id"
          [class.ring-blue-500/10]="selectedWarehouseId() === wh.id"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-sm font-bold text-[color:var(--text-primary)] truncate">{{ wh.name }}</h3>
            <span class="text-[9px] text-[color:var(--text-secondary)] font-bold">{{ wh.id }}</span>
          </div>
          <p class="text-xs text-[color:var(--text-secondary)] mb-4">{{ wh.location }}</p>
          
          <div class="space-y-1">
            <div class="flex justify-between text-[11px]">
              <span>Capacity utilization:</span>
              <span class="font-bold">{{ getUtilizationPercent(wh) | number:'1.1-1' }}%</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div class="h-full bg-blue-600 transition-all duration-500" [style.width.%]="getUtilizationPercent(wh)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ZONING HEATMAP MATRIX & BIN ALLOCATOR -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left 2 Cols: Zone Heatmaps Grid -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-bold text-[color:var(--text-primary)]">Warehouse Bin Map Heatmap</h3>
            <div class="flex gap-4 text-[10px] text-[color:var(--text-secondary)] font-medium">
              <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded bg-slate-200 dark:bg-slate-700"></span>Empty</span>
              <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded bg-blue-500/20"></span>Partial</span>
              <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded bg-emerald-500"></span>Full</span>
            </div>
          </div>

          <!-- Bins Grid Layout -->
          <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <div *ngIf="zones().length === 0" class="text-center py-8 text-xs text-[color:var(--text-secondary)]">
              Loading warehouse zones...
            </div>
            <div class="space-y-6">
              <div *ngFor="let zone of zones()" class="p-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]">
                <h4 class="text-xs font-bold text-[color:var(--text-primary)] mb-3 capitalize">{{ zone.name }}</h4>
                
                <div class="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  <!-- Render real bins from API -->
                  <div 
                    *ngFor="let bin of getBinsForZone(zone.id)"
                    (click)="selectBin(bin)"
                    class="h-12 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105"
                    [ngClass]="{
                      'bg-slate-200 dark:bg-slate-800 border-[color:var(--border-color)]': bin.status === 'EMPTY',
                      'bg-blue-500/20 border-blue-500 text-blue-600': bin.status === 'PARTIAL',
                      'bg-emerald-500 text-white border-emerald-600': bin.status === 'FULL',
                      'ring-2 ring-blue-500': selectedBin()?.id === bin.id
                    }"
                  >
                    <span class="text-[10px] font-bold">{{ bin.binNumber }}</span>
                    <span class="text-[8px] opacity-75">{{ bin.status }}</span>
                  </div>
                  <!-- Placeholder if no bins loaded yet -->
                  <div 
                    *ngIf="getBinsForZone(zone.id).length === 0"
                    class="col-span-4 text-[10px] text-[color:var(--text-secondary)] py-2"
                  >
                    Loading bins...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Col: Selected Bin Inspection & Putaway Simulator -->
        <div class="space-y-6">
          <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <h3 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Storage Inspector</h3>
            
            <div *ngIf="!selectedBin()" class="p-6 text-center text-xs text-[color:var(--text-secondary)]">
              Click any bin in the heatmap grid to inspect contents and put away packages.
            </div>

            <div *ngIf="selectedBin()" class="space-y-4 text-xs">
              <div class="flex justify-between border-b border-[color:var(--border-color)] pb-3">
                <span class="font-bold text-sm text-blue-600 dark:text-blue-400">Bin {{ selectedBin().binNumber }}</span>
                <span class="badge" [ngClass]="{
                  'badge-success': selectedBin().status === 'FULL',
                  'badge-info': selectedBin().status === 'PARTIAL',
                  'badge-pending': selectedBin().status === 'EMPTY'
                }">{{ selectedBin().status }}</span>
              </div>

              <div class="space-y-2 text-[11px] text-[color:var(--text-secondary)]">
                <p><strong>Bin ID</strong>: {{ selectedBin().id }}</p>
                <p><strong>Physical Volumetric Limit</strong>: {{ selectedBin().capacityVolume }} m³</p>
              </div>

              <!-- Putaway simulator -->
              <div class="pt-4 border-t border-[color:var(--border-color)]">
                <h5 class="text-xs font-bold text-[color:var(--text-primary)] mb-2">Simulate Putaway (Bin Allocation)</h5>
                <div class="space-y-3">
                  <div>
                    <label class="block text-[9px] uppercase font-bold text-[color:var(--text-secondary)] mb-1">Set Bin Occupancy Status</label>
                    <select 
                      [(ngModel)]="selectedBinStatus"
                      class="w-full px-3 py-1.5 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                    >
                      <option value="EMPTY">EMPTY (Unallocated)</option>
                      <option value="PARTIAL">PARTIAL (Items stored)</option>
                      <option value="FULL">FULL (At capacity)</option>
                    </select>
                  </div>
                  
                  <button 
                    (click)="updateBinStatus()"
                    class="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                  >
                    Apply Status
                  </button>
                  
                  <div class="p-3 bg-[color:var(--bg-tertiary)] rounded-lg text-[10px] text-[color:var(--text-secondary)]">
                    Updating bin status recalculates the parent warehouse utilization in real-time.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Warehouse Stats -->
          <div *ngIf="selectedWarehouseId()" class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <h4 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Zone Summary</h4>
            <div class="space-y-3">
              <div *ngFor="let zone of zones()" class="flex justify-between items-center text-xs">
                <span class="text-[color:var(--text-secondary)] truncate">{{ zone.name }}</span>
                <span class="font-bold text-[color:var(--text-primary)]">{{ getBinsForZone(zone.id).length }} bins</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class WarehouseComponent implements OnInit {
  warehouses = signal<any[]>([]);
  zones = signal<any[]>([]);
  selectedWarehouseId = signal<string>('');
  selectedBin = signal<any | null>(null);
  selectedBinStatus = 'EMPTY';

  // Map of zone ID -> bins array loaded from backend
  private zoneBinsMap: { [zoneId: string]: any[] } = {};

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.apiService.getWarehouses().subscribe({
      next: (res) => {
        this.warehouses.set(res);
        if (res.length > 0) {
          this.selectWarehouse(res[0].id);
        }
      },
      error: (err) => console.error('Failed to load warehouses', err)
    });
  }

  selectWarehouse(whId: string) {
    this.selectedWarehouseId.set(whId);
    this.selectedBin.set(null);
    this.zoneBinsMap = {}; // Reset bins cache on warehouse change
    
    this.apiService.getZones(whId).subscribe({
      next: (zones) => {
        this.zones.set(zones);
        // Load racks then bins for each zone
        this.apiService.getRacks(whId).subscribe({
          next: (racks) => {
            // For each rack, load shelves and bins
            racks.forEach(rack => {
              const zone = zones.find(z => z.id === rack.zone?.id || zones[0]?.id);
              if (zone) {
                this.apiService.getShelves(whId, zone.id, rack.id).subscribe({
                  next: (shelves) => {
                    shelves.forEach(shelf => {
                      this.apiService.getBins(shelf.id).subscribe({
                        next: (bins) => {
                          if (!this.zoneBinsMap[zone.id]) {
                            this.zoneBinsMap[zone.id] = [];
                          }
                          // Merge bins avoiding duplicates
                          bins.forEach(bin => {
                            if (!this.zoneBinsMap[zone.id].find(b => b.id === bin.id)) {
                              this.zoneBinsMap[zone.id].push(bin);
                            }
                          });
                          // Trigger change detection
                          this.zones.update(z => [...z]);
                        },
                        error: () => {}
                      });
                    });
                  },
                  error: () => {}
                });
              }
            });
          },
          error: () => {}
        });
      },
      error: (err) => console.error('Failed to load zones', err)
    });
  }

  selectBin(bin: any) {
    this.selectedBin.set(bin);
    this.selectedBinStatus = bin.status;
  }

  updateBinStatus() {
    const bin = this.selectedBin();
    if (!bin) return;

    this.apiService.updateBinStatus(bin.id, this.selectedBinStatus).subscribe({
      next: (updatedBin) => {
        // Update the status locally in the map
        Object.keys(this.zoneBinsMap).forEach(zoneId => {
          const idx = this.zoneBinsMap[zoneId].findIndex(b => b.id === bin.id);
          if (idx !== -1) {
            this.zoneBinsMap[zoneId][idx] = updatedBin;
          }
        });

        // Update selected bin
        this.selectedBin.set(updatedBin);
        
        // Trigger change detection
        this.zones.update(z => [...z]);
        
        // Update warehouse utilization metrics
        const wh = this.warehouses().find(w => w.id === this.selectedWarehouseId());
        if (wh) {
          if (this.selectedBinStatus === 'FULL') {
            wh.usedCapacityCubicMeters = Math.min(wh.capacityCubicMeters, (wh.usedCapacityCubicMeters || 0) + bin.capacityVolume);
          } else if (this.selectedBinStatus === 'EMPTY') {
            wh.usedCapacityCubicMeters = Math.max(0, (wh.usedCapacityCubicMeters || 0) - bin.capacityVolume);
          }
          this.warehouses.update(ws => [...ws]);
        }
        
        this.notificationService.addNotification(
          'Bin Status Updated',
          `Bin ${bin.binNumber} set to ${this.selectedBinStatus}.`,
          'INFO'
        );
      },
      error: (err) => console.error('Failed to update bin status', err)
    });
  }

  getBinsForZone(zoneId: string): any[] {
    return this.zoneBinsMap[zoneId] || [];
  }

  getUtilizationPercent(wh: any): number {
    if (!wh.capacityCubicMeters || wh.capacityCubicMeters === 0) return 0;
    return ((wh.usedCapacityCubicMeters || 0) / wh.capacityCubicMeters) * 100;
  }
}
