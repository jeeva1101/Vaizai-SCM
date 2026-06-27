package com.enterprise.scm.service;

import com.enterprise.scm.domain.*;
import com.enterprise.scm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProcurementService {

    @Autowired
    private PurchaseRequestRepository purchaseRequestRepository;

    @Autowired
    private RfqRepository rfqRepository;

    @Autowired
    private QuotationRepository quotationRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ApprovalRuleRepository approvalRuleRepository;

    @Autowired
    private ApprovalHistoryRepository approvalHistoryRepository;

    @Autowired
    private EventPublisher eventPublisher;

    @Autowired
    private NotificationService notificationService;

    public PurchaseRequest createPurchaseRequest(PurchaseRequest pr, String requesterUsername) {
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        pr.setId("PR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        pr.setRequester(requester);
        pr.setOrganization(requester.getOrganization());
        pr.setDepartment(requester.getDepartment());
        pr.setStatus("PENDING_APPROVAL");
        pr.setApprovalLevel(1);

        PurchaseRequest savedPr = purchaseRequestRepository.save(pr);

        System.out.println("\n📝 [PURCHASE REQUEST] New request " + savedPr.getId() + " created for item: " + pr.getItemName() + " (Qty: " + pr.getQuantity() + ", Est. Cost: " + pr.getEstimatedCost() + ") by " + requesterUsername);

        // Notify Approvers
        List<ApprovalRule> rules = approvalRuleRepository.findByOrganizationIdAndModuleOrderBySequenceOrderAsc(
                requester.getOrganization().getId(), "PROCUREMENT"
        );
        if (!rules.isEmpty()) {
            String roleToNotify = rules.get(0).getRequiredRole();
            eventPublisher.publish("purchase-request-created", savedPr.getId(), 
                    "PR Created for: " + pr.getItemName() + " (Total Est: " + pr.getEstimatedCost() + ")");
            notificationService.createNotification("admin", "Approval Required", 
                    "Purchase Request " + savedPr.getId() + " requires approval.", "APPROVAL_REQUEST");
        }

        return savedPr;
    }

    public PurchaseRequest approvePurchaseRequest(String prId, String approverUsername, String remarks) {
        User approver = userRepository.findByUsername(approverUsername)
                .orElseThrow(() -> new RuntimeException("Approver not found"));
        PurchaseRequest pr = purchaseRequestRepository.findById(prId)
                .orElseThrow(() -> new RuntimeException("PR not found"));

        // Deduct department budget (simplified)
        Department dept = pr.getDepartment();
        if (dept != null && dept.getRemainingBudget().compareTo(pr.getEstimatedCost()) < 0) {
            throw new RuntimeException("Department budget exceeded!");
        }

        if (dept != null) {
            dept.setRemainingBudget(dept.getRemainingBudget().subtract(pr.getEstimatedCost()));
            departmentRepository.save(dept);
        }

        pr.setStatus("APPROVED");
        PurchaseRequest savedPr = purchaseRequestRepository.save(pr);

        System.out.println("\n✅ [PURCHASE REQUEST APPROVED] PR " + prId + " approved by " + approverUsername + ". Remarks: " + remarks);

        // Record Approval History
        ApprovalHistory history = ApprovalHistory.builder()
                .referenceId(prId)
                .approver(approver)
                .action("APPROVED")
                .remarks(remarks)
                .sequenceOrder(pr.getApprovalLevel())
                .build();
        approvalHistoryRepository.save(history);

        eventPublisher.publish("purchase-approved", prId, "PR approved by: " + approverUsername);
        notificationService.createNotification(pr.getRequester().getUsername(), "PR Approved", 
                "Your Purchase Request " + prId + " has been approved.", "INFO");

        return savedPr;
    }

    public Rfq createRfq(String prId, String title, String description, LocalDateTime deadline) {
        PurchaseRequest pr = purchaseRequestRepository.findById(prId)
                .orElseThrow(() -> new RuntimeException("PR not found"));

        Rfq rfq = Rfq.builder()
                .id("RFQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .purchaseRequest(pr)
                .title(title)
                .description(description)
                .deadline(deadline)
                .status("OPEN")
                .build();

        pr.setStatus("RFQ_STAGE");
        purchaseRequestRepository.save(pr);

        Rfq savedRfq = rfqRepository.save(rfq);
        System.out.println("\n📢 [RFQ CREATED] RFQ " + savedRfq.getId() + " created from PR: " + prId + " | Title: " + title);
        return savedRfq;
    }

    public Quotation submitQuotation(String rfqId, String vendorId, BigDecimal unitPrice, int leadDays, String remarks) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(rfq.getPurchaseRequest().getQuantity()));

        Quotation quotation = Quotation.builder()
                .id("QT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .rfq(rfq)
                .vendor(vendor)
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .deliveryLeadDays(leadDays)
                .remarks(remarks)
                .status("SUBMITTED")
                .build();

        Quotation savedQuotation = quotationRepository.save(quotation);
        System.out.println("\n💰 [QUOTATION SUBMITTED] QT " + savedQuotation.getId() + " submitted by Vendor " + vendor.getCompanyName() + " for RFQ " + rfqId + " | Total Price: " + totalPrice);
        return savedQuotation;
    }

    public PurchaseOrder selectQuotation(String quotationId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        quotation.setStatus("ACCEPTED");
        quotationRepository.save(quotation);

        Rfq rfq = quotation.getRfq();
        rfq.setStatus("CLOSED");
        rfqRepository.save(rfq);

        PurchaseRequest pr = rfq.getPurchaseRequest();
        pr.setStatus("ORDERED");
        purchaseRequestRepository.save(pr);

        // Auto-Generate Purchase Order
        PurchaseOrder po = PurchaseOrder.builder()
                .id("PO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .purchaseRequest(pr)
                .vendor(quotation.getVendor())
                .totalAmount(quotation.getTotalPrice())
                .status("PENDING_ACCEPTANCE")
                .deliveryDate(LocalDateTime.now().plusDays(quotation.getDeliveryLeadDays()))
                .build();

        PurchaseOrder savedPo = purchaseOrderRepository.save(po);

        System.out.println("\n🤝 [QUOTATION SELECTED & PO CREATED] PO " + savedPo.getId() + " created for Vendor: " + savedPo.getVendor().getCompanyName() + " | Amount: " + savedPo.getTotalAmount());

        eventPublisher.publish("purchase-order-created", savedPo.getId(), 
                "PO created for vendor: " + po.getVendor().getCompanyName() + " (Total: " + po.getTotalAmount() + ")");

        return savedPo;
    }

    public PurchaseOrder acceptPurchaseOrder(String poId) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));

        po.setStatus("ACCEPTED");
        po.setUpdatedAt(LocalDateTime.now());
        PurchaseOrder savedPo = purchaseOrderRepository.save(po);

        System.out.println("\n🤝 [PURCHASE ORDER ACCEPTED] PO " + poId + " accepted.");

        if (po.getPurchaseRequest() != null && po.getPurchaseRequest().getRequester() != null) {
            notificationService.createNotification(
                    po.getPurchaseRequest().getRequester().getUsername(),
                    "Purchase Order Accepted",
                    "Purchase Order " + poId + " has been accepted by the vendor.",
                    "INFO"
            );
        }

        eventPublisher.publish("purchase-order-accepted", poId, "PO accepted: " + poId);

        return savedPo;
    }

    public List<PurchaseRequest> getPurchaseRequests() {
        return purchaseRequestRepository.findAll();
    }

    public List<Rfq> getRfqs() {
        return rfqRepository.findAll();
    }

    public List<Quotation> getQuotationsForRfq(String rfqId) {
        return quotationRepository.findByRfqId(rfqId);
    }

    public List<PurchaseOrder> getPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public void deletePurchaseRequest(String prId) {
        PurchaseRequest pr = purchaseRequestRepository.findById(prId)
                .orElseThrow(() -> new RuntimeException("Purchase Request not found"));
        if (!"DRAFT".equals(pr.getStatus()) && !"PENDING_APPROVAL".equals(pr.getStatus())) {
            throw new RuntimeException("Only draft or pending approval requests can be deleted");
        }
        purchaseRequestRepository.delete(pr);
    }
}
