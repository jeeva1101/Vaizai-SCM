import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==========================================
  // DASHBOARD APIS
  // ==========================================
  getDashboardSummary(role?: string): Observable<any> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }
    return this.http.get<any>(`${this.baseUrl}/dashboard/summary`, { params });
  }

  // ==========================================
  // PROCUREMENT APIS
  // ==========================================
  getPurchaseRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/procurement/requests`);
  }

  createPurchaseRequest(pr: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/procurement/requests`, pr);
  }

  approvePurchaseRequest(prId: string, remarks: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/procurement/requests/${prId}/approve`, { remarks });
  }

  deleteRequest(prId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/procurement/requests/${prId}`);
  }

  getRfqs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/procurement/rfqs`);
  }

  createRfq(prId: string, title: string, description: string, deadline: string): Observable<any> {
    const payload = { purchaseRequestId: prId, title, description, deadline };
    return this.http.post<any>(`${this.baseUrl}/procurement/rfqs`, payload);
  }

  getQuotations(rfqId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/procurement/rfqs/${rfqId}/quotations`);
  }

  submitQuotation(rfqId: string, vendorId: string, unitPrice: number, leadDays: number, remarks: string): Observable<any> {
    const payload = { rfqId, vendorId, unitPrice, deliveryLeadDays: leadDays, remarks };
    return this.http.post<any>(`${this.baseUrl}/procurement/quotations`, payload);
  }

  selectQuotation(quoteId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/procurement/quotations/${quoteId}/select`, {});
  }

  getPurchaseOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/procurement/orders`);
  }

  acceptPurchaseOrder(poId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/procurement/orders/${poId}/accept`, {});
  }

  // ==========================================
  // INVENTORY APIS
  // ==========================================
  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/inventory`);
  }

  getInventoryItem(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/inventory/items/${id}`);
  }

  createInventoryItem(item: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/inventory/items`, item);
  }

  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/inventory/transactions`);
  }

  stockIn(itemId: string, quantity: number, binId: string, referenceId: string): Observable<any> {
    const payload = { inventoryItemId: itemId, quantity, destinationBinId: binId, referenceId };
    return this.http.post<any>(`${this.baseUrl}/inventory/stock-in`, payload);
  }

  stockOut(itemId: string, quantity: number, binId: string, referenceId: string): Observable<any> {
    const payload = { inventoryItemId: itemId, quantity, sourceBinId: binId, referenceId };
    return this.http.post<any>(`${this.baseUrl}/inventory/stock-out`, payload);
  }

  transferStock(itemId: string, quantity: number, sourceBinId: string, destBinId: string): Observable<any> {
    const payload = { inventoryItemId: itemId, quantity, sourceBinId, destinationBinId: destBinId };
    return this.http.post<any>(`${this.baseUrl}/inventory/transfer`, payload);
  }

  // ==========================================
  // WAREHOUSE APIS
  // ==========================================
  getWarehouses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/warehouses`);
  }

  getZones(whId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/warehouses/${whId}/zones`);
  }

  getRacks(whId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/warehouses/${whId}/racks`);
  }

  getShelves(whId: string, zoneId: string, rackId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/warehouses/${whId}/zones/${zoneId}/racks/${rackId}/shelves`);
  }

  getBins(shelfId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/warehouses/shelves/${shelfId}/bins`);
  }

  getAllBins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/warehouses/bins`);
  }

  getWarehouseUtilization(whId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/warehouses/${whId}/utilization`);
  }

  updateBinStatus(binId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/warehouses/bins/${binId}/status`, { status });
  }

  // ==========================================
  // CUSTOMER ORDERS APIS
  // ==========================================
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders`);
  }

  createOrder(order: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/orders`, order);
  }

  getOrderItems(orderId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders/${orderId}/items`);
  }

  // ==========================================
  // LOGISTICS APIS
  // ==========================================
  getShipments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/logistics/shipments`);
  }

  getMilestones(shpId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/logistics/shipments/${shpId}/milestones`);
  }

  createShipment(shipment: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/logistics/shipments`, shipment);
  }

  addMilestone(shpId: string, milestone: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/logistics/shipments/${shpId}/milestones`, milestone);
  }

  // ==========================================
  // APPROVAL RULES APIS
  // ==========================================
  getApprovalRules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/approvals/rules`);
  }

  saveApprovalRule(rule: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/approvals/rules`, rule);
  }

  getApprovalHistory(refId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/approvals/history/${refId}`);
  }

  // ==========================================
  // AI CHAT ASSISTANT
  // ==========================================
  askAiAssistant(message: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai-assistant/chat`, { message });
  }

  // ==========================================
  // VENDOR APIS
  // ==========================================
  getVendors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/vendors`);
  }

  getVendorProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/vendors/me`);
  }

  getVendorRfqs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/vendors/me/rfqs`);
  }

  getVendorQuotations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/vendors/me/quotations`);
  }

  // ==========================================
  // USER APIS
  // ==========================================
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users`, user);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/${userId}/role`, { role });
  }

  updateUserStatus(userId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/${userId}/status`, { status });
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/me/notifications`);
  }

  markNotificationRead(notifId: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/me/notifications/${notifId}/read`, {});
  }

  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/audit-logs`);
  }

  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/departments`);
  }

  deleteApprovalRule(ruleId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/approvals/rules/${ruleId}`);
  }

  // ==========================================
  // SHIPMENT CREATION
  // ==========================================
  updateShipmentStatus(shpId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/logistics/shipments/${shpId}/status`, { status });
  }
}
