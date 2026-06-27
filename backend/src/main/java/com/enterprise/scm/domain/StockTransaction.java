package com.enterprise.scm.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StockTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InventoryItem inventoryItem;

    @Column(name = "transaction_type", nullable = false)
    private String transactionType; // STOCK_IN, STOCK_OUT, TRANSFER

    @Column(nullable = false)
    private Integer quantity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_bin_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private WarehouseBin sourceBin;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_bin_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private WarehouseBin destinationBin;

    @Column(name = "reference_id")
    private String referenceId; // Purchase Order, Customer Order, Transfer ID

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "performed_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User performedBy;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
