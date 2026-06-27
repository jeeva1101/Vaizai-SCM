import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Message {
  sender: 'USER' | 'AI';
  text: string;
  data?: any;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-64px)] flex flex-col bg-[color:var(--bg-primary)]">
      
      <!-- Top header bar -->
      <div class="px-6 py-4 border-b border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] flex justify-between items-center shrink-0">
        <div>
          <h2 class="text-sm font-bold text-[color:var(--text-primary)]">Enterprise AI SCM Assistant</h2>
          <p class="text-[10px] text-[color:var(--text-secondary)]">Heuristics-driven natural language intelligence broker.</p>
        </div>
        <span class="badge badge-success">Online & Listening</span>
      </div>

      <!-- Chat Bubbles Scroller -->
      <div class="flex-1 p-6 overflow-y-auto space-y-6">
        
        <!-- Welcome Prompt -->
        <div class="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 max-w-xl text-xs space-y-2">
          <p class="font-bold text-blue-600 dark:text-blue-400">💡 SCM Chat Shortcuts</p>
          <p class="text-[color:var(--text-secondary)]">Try asking me these inquiries:</p>
          <ul class="list-disc pl-4 space-y-1 text-[color:var(--text-secondary)]">
            <li>Check inventory levels: <code class="bg-[color:var(--bg-tertiary)] px-1 rounded">check stock MCU</code></li>
            <li>Inspect supplier scores: <code class="bg-[color:var(--bg-tertiary)] px-1 rounded">Apex score</code></li>
            <li>Run demand forecasting projections: <code class="bg-[color:var(--bg-tertiary)] px-1 rounded">forecast MCU</code></li>
            <li>Track dispatched shipments: <code class="bg-[color:var(--bg-tertiary)] px-1 rounded">track SHP-3001</code></li>
          </ul>
        </div>

        <!-- Dynamic Message List -->
        <div 
          *ngFor="let msg of messages()" 
          [ngClass]="{
            'justify-end': msg.sender === 'USER',
            'justify-start': msg.sender === 'AI'
          }" 
          class="flex"
        >
          <div 
            [ngClass]="{
              'bg-blue-600 text-white rounded-tr-none': msg.sender === 'USER',
              'bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] border border-[color:var(--border-color)] rounded-tl-none': msg.sender === 'AI'
            }" 
            class="max-w-xl p-4 rounded-2xl text-xs shadow-md space-y-3"
          >
            <!-- Markdown message parser simulated -->
            <div class="whitespace-pre-wrap leading-relaxed" [innerHTML]="msg.text"></div>

            <!-- Nested Data tables / Details if returned by the AI -->
            <div *ngIf="msg.data" class="pt-3 border-t border-[color:var(--border-color)]">
              
              <!-- 1. Forecast Table -->
              <div *ngIf="isArray(msg.data)">
                <table class="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr class="border-b border-[color:var(--border-color)] text-[color:var(--text-secondary)] font-bold uppercase">
                      <th class="py-1">Period</th>
                      <th>Quantity Demand</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let f of msg.data" class="border-b border-[color:var(--border-color)] last:border-b-0">
                      <td class="py-1.5 font-bold">{{ f.period }}</td>
                      <td>{{ f.quantity }} units</td>
                      <td>
                        <span class="badge" [ngClass]="{'badge-success': f.type === 'FORECASTED', 'badge-info': f.type === 'ACTUAL'}">
                          {{ f.type }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 2. Shipment detail -->
              <div *ngIf="isShipment(msg.data)" class="space-y-1 text-[10px] text-[color:var(--text-secondary)]">
                <p>Carrier Name: <strong>{{ msg.data.carrier }}</strong></p>
                <p>License Plate: <strong>{{ msg.data.vehicleNumber }}</strong></p>
                <p>Status: <strong>{{ msg.data.status }}</strong></p>
              </div>

              <!-- 3. Inventory details -->
              <div *ngIf="isInventory(msg.data)" class="space-y-1 text-[10px] text-[color:var(--text-secondary)]">
                <p>SKU Part Code: <strong>{{ msg.data.sku }}</strong></p>
                <p>Description: <strong>{{ msg.data.description }}</strong></p>
                <p>Price: <strong>₹{{ msg.data.unitPrice }}</strong></p>
              </div>

            </div>
          </div>
        </div>

        <!-- Skeleton Typing Loader -->
        <div *ngIf="typing()" class="flex justify-start">
          <div class="bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] max-w-xs p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
            <span class="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 0ms"></span>
            <span class="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 150ms"></span>
            <span class="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 300ms"></span>
          </div>
        </div>

      </div>

      <!-- Chat Bottom Input Area -->
      <div class="px-6 py-4 border-t border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shrink-0">
        <form (submit)="send()" class="flex gap-2">
          <input 
            type="text" 
            name="msgInput"
            [(ngModel)]="userMessage"
            class="flex-1 px-4 py-2.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] text-xs focus:outline-none"
            placeholder="Type SCM inquiry..."
            autocomplete="off"
            [disabled]="typing()"
          >
          <button 
            type="submit" 
            [disabled]="!userMessage.trim() || typing()"
            class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 transition-all"
          >
            Ask AI
          </button>
        </form>
      </div>

    </div>
  `
})
export class AiAssistantComponent {
  userMessage = '';
  typing = signal<boolean>(false);
  
  messages = signal<Message[]>([
    {
      sender: 'AI',
      text: 'Welcome to the SCM AI Command Desk. Ask me to query inventory counts, retrieve carrier tracking coordinates, run demand forecasts, or check vendor ratings.',
      timestamp: new Date()
    }
  ]);

  constructor(private apiService: ApiService) {}

  send() {
    if (!this.userMessage.trim()) return;

    const query = this.userMessage;
    this.userMessage = '';
    
    // Add user bubble
    const userMsg: Message = { sender: 'USER', text: query, timestamp: new Date() };
    this.messages.update(prev => [...prev, userMsg]);
    
    this.typing.set(true);

    // Call REST endpoint
    this.apiService.askAiAssistant(query).subscribe({
      next: (res) => {
        setTimeout(() => { // Add a short delay for simulated AI thinking
          this.typing.set(false);
          const aiMsg: Message = {
            sender: 'AI',
            text: res.reply,
            data: res.data,
            timestamp: new Date()
          };
          this.messages.update(prev => [...prev, aiMsg]);
        }, 800);
      },
      error: (err) => {
        this.typing.set(false);
        const errMsg: Message = {
          sender: 'AI',
          text: `⚠️ Request failed: ${err.error?.error || err.message || 'Unable to connect to AI service. Ensure the backend is running.'}`,
          timestamp: new Date()
        };
        this.messages.update(prev => [...prev, errMsg]);
      }
    });
  }

  // Type checker helpers for nested data rendering
  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  isShipment(val: any): boolean {
    return val && val.carrier !== undefined;
  }

  isInventory(val: any): boolean {
    return val && val.sku !== undefined;
  }
}
