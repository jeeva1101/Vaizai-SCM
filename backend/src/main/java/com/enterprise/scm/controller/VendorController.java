package com.enterprise.scm.controller;

import com.enterprise.scm.domain.Rfq;
import com.enterprise.scm.domain.Quotation;
import com.enterprise.scm.domain.Vendor;
import com.enterprise.scm.repository.QuotationRepository;
import com.enterprise.scm.repository.RfqRepository;
import com.enterprise.scm.repository.UserRepository;
import com.enterprise.scm.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vendors")
public class VendorController {

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RfqRepository rfqRepository;

    @Autowired
    private QuotationRepository quotationRepository;

    /** List all vendors — SUPER_ADMIN and PROCUREMENT_MANAGER */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ResponseEntity<List<Vendor>> getAllVendors() {
        return ResponseEntity.ok(vendorRepository.findAll());
    }

    /** Get current vendor's profile (linked via user_id) */
    @GetMapping("/me")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> getMyVendorProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).map(user ->
            vendorRepository.findByUserId(user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build())
        ).orElse(ResponseEntity.notFound().build());
    }

    /** Get all open RFQs visible to the current vendor */
    @GetMapping("/me/rfqs")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<Rfq>> getVendorRfqs() {
        List<Rfq> openRfqs = rfqRepository.findAll().stream()
                .filter(r -> "OPEN".equals(r.getStatus()))
                .toList();
        return ResponseEntity.ok(openRfqs);
    }

    /** Get all quotations submitted by the current vendor */
    @GetMapping("/me/quotations")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> getVendorQuotations() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).map(user ->
            vendorRepository.findByUserId(user.getId()).map(vendor -> {
                List<Quotation> quotes = quotationRepository.findAll().stream()
                        .filter(q -> q.getVendor() != null && q.getVendor().getId().equals(vendor.getId()))
                        .toList();
                return ResponseEntity.ok(quotes);
            }).orElse(ResponseEntity.notFound().build())
        ).orElse(ResponseEntity.notFound().build());
    }
}
