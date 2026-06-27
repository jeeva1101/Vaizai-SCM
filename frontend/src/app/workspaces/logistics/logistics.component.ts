import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-logistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-content-scroll bg-[color:var(--bg-primary)]">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[color:var(--text-primary)]">Logistics & Route Dispatch</h1>
          <p class="text-xs text-[color:var(--text-secondary)]">Track carrier transits, update vehicle milestones, and view GPS simulations.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Column 1: Shipments List -->
        <div class="space-y-6">
          <h3 class="text-sm font-bold text-[color:var(--text-primary)]">Carrier Dispatch Queue</h3>
          
          <div class="space-y-4">
            <div *ngIf="shipments().length === 0" class="p-6 glass-card bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-center text-xs text-[color:var(--text-secondary)]">
              No shipments dispatched.
            </div>

            <div 
              *ngFor="let s of shipments()" 
              (click)="selectShipment(s)"
              class="glass-card p-5 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] cursor-pointer transition-all hover:-translate-y-0.5"
              [class.border-blue-600]="selectedShipment()?.id === s.id"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-xs text-blue-600 dark:text-blue-400">{{ s.id }}</span>
                <span class="badge" [ngClass]="{
                  'badge-success': s.status === 'DELIVERED',
                  'badge-info': s.status === 'IN_TRANSIT' || s.status === 'DISPATCHED' || s.status === 'OUT_FOR_DELIVERY',
                  'badge-pending': s.status === 'CREATED'
                }">{{ s.status }}</span>
              </div>
              <h4 class="font-bold text-xs text-[color:var(--text-primary)] mb-1">Carrier: {{ s.carrier }}</h4>
              <p class="text-[11px] text-[color:var(--text-secondary)]">Vehicle: {{ s.vehicleNumber }}</p>
              
              <div class="mt-4 pt-3 border-t border-[color:var(--border-color)] flex justify-between items-center text-[10px] text-[color:var(--text-secondary)]">
                <span>Driver: {{ s.driverName }}</span>
                <span>ETA: {{ s.estimatedArrival | date:'shortTime' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Column 2 & 3: GPS map simulation and Milestones -->
        <div *ngIf="selectedShipment()" class="lg:col-span-2 space-y-6">
          
          <!-- Route GPS Map Simulator -->
          <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-sm font-bold text-[color:var(--text-primary)]">Live GPS Tracking Simulation</h4>
              <button 
                *ngIf="selectedShipment().status !== 'DELIVERED'"
                (click)="simulateNextMilestone()"
                class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold transition-all"
              >
                Simulate Next Stop
              </button>
            </div>

            <!-- Simulated SVG Map Path -->
            <div class="h-60 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[color:var(--border-color)] relative overflow-hidden flex items-center justify-center">
              <svg class="absolute inset-0 w-full h-full p-6 text-slate-300 dark:text-slate-700" viewBox="0 0 400 200" fill="none" stroke="currentColor">
                <!-- Roads/Grids representation -->
                <path d="M 50 100 Q 150 30 200 120 T 350 100" stroke-width="4" stroke-dasharray="8 4" />
                <!-- Nodes -->
                <circle cx="50" cy="100" r="8" fill="#3b82f6" stroke="white" stroke-width="2" />
                <circle cx="200" cy="120" r="8" fill="#eab308" stroke="white" stroke-width="2" />
                <circle cx="350" cy="100" r="8" fill="#10b981" stroke="white" stroke-width="2" />
                
                <!-- Label text -->
                <text x="35" y="125" class="text-[9px] fill-slate-500 font-bold" stroke="none">Dallas Hub</text>
                <text x="180" y="145" class="text-[9px] fill-slate-500 font-bold" stroke="none">OKC Station</text>
                <text x="330" y="125" class="text-[9px] fill-slate-500 font-bold" stroke="none">Denver Depot</text>

                <!-- Truck pointer -->
                <circle 
                  [attr.cx]="getTruckCoordinates().x" 
                  [attr.cy]="getTruckCoordinates().y" 
                  r="6" 
                  fill="#ef4444" 
                  stroke="white" 
                  stroke-width="1.5" 
                  class="animate-ping"
                />
                <circle 
                  [attr.cx]="getTruckCoordinates().x" 
                  [attr.cy]="getTruckCoordinates().y" 
                  r="5" 
                  fill="#ef4444" 
                  stroke="white" 
                  stroke-width="1.5" 
                />
              </svg>

              <!-- Stats Overlay panel -->
              <div class="absolute bottom-4 left-4 p-3 rounded-lg bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-[10px] space-y-0.5">
                <p><strong>Carrier Route</strong>: Dallas ➔ Denver</p>
                <p><strong>Current Node</strong>: {{ getTruckLocation() }}</p>
                <p><strong>Milestone State</strong>: {{ selectedShipment().status }}</p>
              </div>
            </div>
          </div>

          <!-- Milestones timeline -->
          <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <h4 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Milestone Chronology</h4>

            <div class="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-6">
              <div 
                *ngFor="let m of milestones()" 
                class="relative"
              >
                <!-- Dot marker -->
                <span class="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 ring-4 ring-[color:var(--bg-secondary)]">
                  <span class="h-2 w-2 rounded-full bg-white"></span>
                </span>
                
                <div class="flex flex-col gap-0.5">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-[color:var(--text-primary)]">{{ m.status }}</span>
                    <span class="text-[9px] text-[color:var(--text-secondary)]">— {{ m.location }}</span>
                  </div>
                  <span class="text-[11px] text-[color:var(--text-secondary)]">{{ m.description }}</span>
                  <span class="text-[9px] text-[color:var(--text-secondary)] mt-1 font-semibold">{{ m.timestamp | date:'medium' }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class LogisticsComponent implements OnInit {
  shipments = signal<any[]>([]);
  selectedShipment = signal<any | null>(null);
  milestones = signal<any[]>([]);

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadShipments();
  }

  loadShipments() {
    this.apiService.getShipments().subscribe(res => {
      this.shipments.set(res);
      if (res.length > 0) {
        this.selectShipment(res[0]);
      }
    });
  }

  selectShipment(shp: any) {
    this.selectedShipment.set(shp);
    this.apiService.getMilestones(shp.id).subscribe(res => this.milestones.set(res));
  }

  simulateNextMilestone() {
    const s = this.selectedShipment();
    if (!s) return;

    let nextStatus = 'DISPATCHED';
    let nextLoc = 'Dallas Hub';
    let nextDesc = '';
    let lat = 32.7767;
    let lon = -96.7970;

    if (s.status === 'CREATED') {
      nextStatus = 'DISPATCHED';
      nextLoc = 'Dallas Hub';
      nextDesc = 'Vehicle departed distribution facility.';
      lat = 32.7767;
      lon = -96.7970;
    } else if (s.status === 'DISPATCHED') {
      nextStatus = 'IN_TRANSIT';
      nextLoc = 'Oklahoma City Station';
      nextDesc = 'Arrived at sorting facility for routing.';
      lat = 35.4676;
      lon = -97.5164;
    } else if (s.status === 'IN_TRANSIT') {
      nextStatus = 'OUT_FOR_DELIVERY';
      nextLoc = 'Denver Hub';
      nextDesc = 'Shipment loaded onto regional delivery truck.';
      lat = 39.7392;
      lon = -104.9903;
    } else if (s.status === 'OUT_FOR_DELIVERY') {
      nextStatus = 'DELIVERED';
      nextLoc = 'Client Site (Denver Depot)';
      nextDesc = 'Package delivered. Signed by receiver.';
      lat = 39.7392;
      lon = -104.9903;
    } else {
      return; // Already delivered
    }

    const payload = {
      status: nextStatus,
      location: nextLoc,
      latitude: lat,
      longitude: lon,
      description: nextDesc
    };

    this.apiService.addMilestone(s.id, payload).subscribe(() => {
      this.apiService.getMilestones(s.id).subscribe(res => {
        this.milestones.set(res);
        s.status = nextStatus;
        this.notificationService.addNotification(
          'Logistics Milestone',
          `Shipment ${s.id} updated: ${nextStatus} at ${nextLoc}`,
          'INFO'
        );
      });
    });
  }

  getTruckCoordinates(): { x: number; y: number } {
    const status = this.selectedShipment()?.status;
    if (status === 'CREATED' || status === 'DISPATCHED') {
      return { x: 50, y: 100 }; // Dallas
    } else if (status === 'IN_TRANSIT') {
      return { x: 200, y: 120 }; // OKC
    } else {
      return { x: 350, y: 100 }; // Denver
    }
  }

  getTruckLocation(): string {
    const status = this.selectedShipment()?.status;
    if (status === 'CREATED' || status === 'DISPATCHED') {
      return 'Dallas Facility';
    } else if (status === 'IN_TRANSIT') {
      return 'OKC Station';
    } else {
      return 'Denver Depot';
    }
  }
}
