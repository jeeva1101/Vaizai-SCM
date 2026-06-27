import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-workflow-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-content-scroll bg-[color:var(--bg-primary)]">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[color:var(--text-primary)]">Approval Workflow Rules</h1>
          <p class="text-xs text-[color:var(--text-secondary)]">Design amount thresholds, escalations, and manager approval chains for procurement requisitioning.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Rules Visual Flow Diagram -->
        <div class="lg:col-span-2 space-y-6">
          <h3 class="text-sm font-bold text-[color:var(--text-primary)]">Visual Approval Chain (Procurement Module)</h3>

          <div class="space-y-4 relative">
            <div 
              *ngFor="let rule of rules(); let i = index" 
              class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] flex justify-between items-center relative"
            >
              <div class="flex gap-4 items-center">
                <div class="h-10 w-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                  L{{ rule.sequenceOrder }}
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wide">Approval Authority</span>
                  <span class="text-sm font-bold text-[color:var(--text-primary)]">{{ rule.requiredRole.replace('ROLE_', '') }}</span>
                  <span class="text-[11px] text-[color:var(--text-secondary)]">
                    Threshold: <strong>₹{{ rule.minAmount | number }}</strong>
                    <span *ngIf="rule.maxAmount"> to <strong>₹{{ rule.maxAmount | number }}</strong></span>
                    <span *ngIf="!rule.maxAmount">+ (Infinite)</span>
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span class="badge badge-success">Active Constraint</span>
                <button 
                  (click)="deleteRule(rule.id)"
                  class="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>

              <!-- Connector line -->
              <div 
                *ngIf="i < rules().length - 1" 
                class="absolute -bottom-6 left-9 w-0.5 h-6 bg-slate-300 dark:bg-slate-700 z-0"
              ></div>
            </div>
          </div>
        </div>

        <!-- Add Rule panel -->
        <div class="space-y-6">
          <div class="glass-card p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]">
            <h3 class="text-sm font-bold text-[color:var(--text-primary)] mb-4">Rule Configuration Panel</h3>

            <form (submit)="addRule()">
              <div class="space-y-4">
                <div>
                  <label class="block text-[10px] uppercase font-bold text-[color:var(--text-secondary)] mb-1">Approval level</label>
                  <input 
                    type="number" 
                    name="level"
                    required
                    [(ngModel)]="newRule.sequenceOrder"
                    class="w-full px-3 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                    placeholder="1"
                  >
                </div>

                <div>
                  <label class="block text-[10px] uppercase font-bold text-[color:var(--text-secondary)] mb-1">Required Authority</label>
                  <select 
                    name="role"
                    required
                    [(ngModel)]="newRule.requiredRole"
                    class="w-full px-3 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                  >
                    <option value="PROCUREMENT_MANAGER">PROCUREMENT_MANAGER</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] uppercase font-bold text-[color:var(--text-secondary)] mb-1">Min Value (₹)</label>
                    <input 
                      type="number" 
                      name="min"
                      required
                      [(ngModel)]="newRule.minAmount"
                      class="w-full px-3 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                      placeholder="0"
                    >
                  </div>
                  <div>
                    <label class="block text-[10px] uppercase font-bold text-[color:var(--text-secondary)] mb-1">Max Value (₹)</label>
                    <input 
                      type="number" 
                      name="max"
                      [(ngModel)]="newRule.maxAmount"
                      class="w-full px-3 py-2 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
                      placeholder="Leave blank if unlimited"
                    >
                  </div>
                </div>

                <button 
                  type="submit"
                  class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/10"
                >
                  Configure Approval Step
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  `
})
export class WorkflowBuilderComponent implements OnInit {
  rules = signal<any[]>([]);

  newRule = { sequenceOrder: 4, requiredRole: 'PROCUREMENT_MANAGER', minAmount: 10000, maxAmount: null as number | null };

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadRules();
  }

  loadRules() {
    this.apiService.getApprovalRules().subscribe(res => {
      this.rules.set(res.sort((a, b) => a.sequenceOrder - b.sequenceOrder));
      this.newRule.sequenceOrder = res.length + 1;
    });
  }

  addRule() {
    this.apiService.saveApprovalRule(this.newRule).subscribe(() => {
      this.loadRules();
      this.notificationService.addNotification(
        'Approval Workflow Updated',
        `New rule level L${this.newRule.sequenceOrder} configured for role: ${this.newRule.requiredRole}.`,
        'INFO'
      );
    });
  }

  deleteRule(ruleId: any) {
    if (!ruleId) return;
    if (confirm('Remove this approval rule from the workflow chain?')) {
      this.apiService.deleteApprovalRule(String(ruleId)).subscribe({
        next: () => {
          this.loadRules();
          this.notificationService.addNotification(
            'Approval Rule Removed',
            'Approval rule has been removed from the workflow chain.',
            'INFO'
          );
        },
        error: (err) => alert('Failed to delete rule: ' + (err.error?.error || err.message))
      });
    }
  }
}
