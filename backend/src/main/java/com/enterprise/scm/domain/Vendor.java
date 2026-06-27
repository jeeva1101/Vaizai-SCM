package com.enterprise.scm.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Vendor {
    @Id
    private String id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User user;

    @Column(name = "company_name", nullable = false, unique = true)
    private String companyName;

    @Column(name = "contact_name")
    private String contactName;

    @Column(nullable = false)
    private String email;

    private String phone;
    private String address;

    @Column(name = "verification_status")
    @Builder.Default
    private String verificationStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "product_categories")
    private String productCategories;

    @Column(name = "delivery_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal deliveryScore = new BigDecimal("100.00");

    @Column(name = "quality_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal qualityScore = new BigDecimal("100.00");

    @Column(name = "cost_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal costScore = new BigDecimal("100.00");

    @Column(name = "reliability_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal reliabilityScore = new BigDecimal("100.00");

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
