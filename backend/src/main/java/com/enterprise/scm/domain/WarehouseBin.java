package com.enterprise.scm.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "warehouse_bins")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WarehouseBin {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shelf_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private WarehouseShelf shelf;

    @Column(name = "bin_number", nullable = false, length = 10)
    private String binNumber;

    @Column(name = "capacity_volume", nullable = false, precision = 5, scale = 2)
    private BigDecimal capacityVolume;

    @Column(nullable = false)
    @Builder.Default
    private String status = "EMPTY"; // EMPTY, PARTIAL, FULL

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
