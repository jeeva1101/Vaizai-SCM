-- 1. Organizations Seed
INSERT INTO organizations (id, name, domain, status) VALUES 
('ORG-001', 'Enterprise Supply Chain Corp', 'scm-corp.com', 'ACTIVE');

-- 2. Departments Seed
INSERT INTO departments (id, organization_id, name, code, budget_limit, remaining_budget) VALUES 
('DEP-001', 'ORG-001', 'Procurement & Purchasing', 'PROC', 1000000.00, 850000.00),
('DEP-002', 'ORG-001', 'Inventory Control', 'INVT', 500000.00, 450000.00),
('DEP-003', 'ORG-001', 'Logistics & Dispatch', 'LOGS', 750000.00, 680000.00);

-- 3. Users Seed (Password: "password" BCrypt Hash: $2a$10$B9v1fOf9ucm2wsU/oqLFvOQwLTNZo.nkYVIy3ruifOiUKWFMwTF1G)
INSERT INTO users (id, organization_id, department_id, username, email, password_hash, full_name, role, status, phone) VALUES 
('USR-ADMIN', 'ORG-001', 'DEP-001', 'admin', 'admin@scm.com', '$2a$10$B9v1fOf9ucm2wsU/oqLFvOQwLTNZo.nkYVIy3ruifOiUKWFMwTF1G', 'Elizabeth Admin', 'SUPER_ADMIN', 'ACTIVE', '+1234567890'),
('USR-PROC', 'ORG-001', 'DEP-001', 'procurement', 'procurement@scm.com', '$2a$10$B9v1fOf9ucm2wsU/oqLFvOQwLTNZo.nkYVIy3ruifOiUKWFMwTF1G', 'John Procurement', 'PROCUREMENT_MANAGER', 'ACTIVE', '+1234567891'),
('USR-INVT', 'ORG-001', 'DEP-002', 'inventory', 'inventory@scm.com', '$2a$10$B9v1fOf9ucm2wsU/oqLFvOQwLTNZo.nkYVIy3ruifOiUKWFMwTF1G', 'Sarah Inventory', 'INVENTORY_MANAGER', 'ACTIVE', '+1234567892'),
('USR-WARE', 'ORG-001', 'DEP-002', 'warehouse', 'warehouse@scm.com', '$2a$10$B9v1fOf9ucm2wsU/oqLFvOQwLTNZo.nkYVIy3ruifOiUKWFMwTF1G', 'Marcus Warehouse', 'WAREHOUSE_MANAGER', 'ACTIVE', '+1234567893'),
('USR-LOGS', 'ORG-001', 'DEP-003', 'logistics', 'logistics@scm.com', '$2a$10$B9v1fOf9ucm2wsU/oqLFvOQwLTNZo.nkYVIy3ruifOiUKWFMwTF1G', 'Clara Logistics', 'LOGISTICS_MANAGER', 'ACTIVE', '+1234567894'),
('USR-VEND', 'ORG-001', NULL, 'vendor', 'vendor@scm.com', '$2a$10$B9v1fOf9ucm2wsU/oqLFvOQwLTNZo.nkYVIy3ruifOiUKWFMwTF1G', 'Apex Supplier representative', 'VENDOR', 'ACTIVE', '+1234567895'),
('USR-EMPL', 'ORG-001', 'DEP-001', 'employee', 'employee@scm.com', '$2a$10$B9v1fOf9ucm2wsU/oqLFvOQwLTNZo.nkYVIy3ruifOiUKWFMwTF1G', 'Robert Employee', 'EMPLOYEE', 'ACTIVE', '+1234567896');

-- 4. Vendors Seed
INSERT INTO vendors (id, user_id, company_name, contact_name, email, phone, address, verification_status, product_categories, delivery_score, quality_score, cost_score, reliability_score) VALUES 
('VEN-001', 'USR-VEND', 'Apex Electronic Components Ltd', 'Sarah Connor', 'apex@suppliers.com', '+18005550199', '100 Silicon Way, Tech Park, Austin, TX', 'APPROVED', 'Semiconductors, Sensors', 94.50, 96.00, 88.00, 95.00),
('VEN-002', NULL, 'Global Cable Solutions Inc', 'David Lightman', 'info@globalcables.com', '+18005550299', '500 Copper Rd, Industrial Zone, Chicago, IL', 'APPROVED', 'Cables, Connectors', 88.20, 91.50, 92.50, 89.00),
('VEN-003', NULL, 'Logistics Pack Co', 'John Doe', 'sales@logipack.com', '+18005550399', '75 Corrugated St, Packaging District, Atlanta, GA', 'PENDING', 'Packaging Materials', 100.00, 100.00, 100.00, 100.00);

-- 5. Warehouses Seed
INSERT INTO warehouses (id, organization_id, name, location, capacity_cubic_meters, used_capacity_cubic_meters) VALUES 
('WH-001', 'ORG-001', 'Primary Distribution Center (PDC)', 'Warehouse District Building 4, Dallas, TX', 10000.00, 450.00),
('WH-002', 'ORG-001', 'Cold Storage & HAZMAT Facility', 'Northside Hub Suite B, Chicago, IL', 5000.00, 120.00);

-- 6. Warehouse Zones Seed
INSERT INTO warehouse_zones (id, warehouse_id, name, capacity_limit) VALUES 
('ZONE-001', 'WH-001', 'Ambient Storage Zone', 8000.00),
('ZONE-002', 'WH-001', 'High-Value Vault', 2000.00),
('ZONE-003', 'WH-002', 'Refrigerated Zone (2-8C)', 3000.00),
('ZONE-004', 'WH-002', 'HAZMAT Bio-Containment', 2000.00);

-- 7. Warehouse Racks Seed
INSERT INTO warehouse_racks (id, zone_id, rack_number) VALUES 
('RACK-A1', 'ZONE-001', 'A1'),
('RACK-A2', 'ZONE-001', 'A2'),
('RACK-B1', 'ZONE-002', 'B1'),
('RACK-C1', 'ZONE-003', 'C1');

-- 8. Warehouse Shelves Seed
INSERT INTO warehouse_shelves (id, rack_id, shelf_number) VALUES 
('SHELF-A1-S1', 'RACK-A1', 'S1'),
('SHELF-A1-S2', 'RACK-A1', 'S2'),
('SHELF-B1-S1', 'RACK-B1', 'S1'),
('SHELF-C1-S1', 'RACK-C1', 'S1');

-- 9. Warehouse Bins Seed
INSERT INTO warehouse_bins (id, shelf_id, bin_number, capacity_volume, status) VALUES 
('BIN-A1-S1-01', 'SHELF-A1-S1', 'B01', 5.0, 'PARTIAL'),
('BIN-A1-S1-02', 'SHELF-A1-S1', 'B02', 5.0, 'EMPTY'),
('BIN-B1-S1-01', 'SHELF-B1-S1', 'B01', 2.0, 'PARTIAL'),
('BIN-C1-S1-01', 'SHELF-C1-S1', 'B01', 4.0, 'PARTIAL');

-- 10. Inventory Items Seed
INSERT INTO inventory_items (id, organization_id, bin_id, sku, name, description, quantity, unit_price, reorder_level, reorder_quantity, batch_number, serial_number, expiry_date, status) VALUES 
('INV-001', 'ORG-001', 'BIN-B1-S1-01', 'SKU-MCU-X90', 'Microcontroller Unit MCU-X90', 'High-performance 32-bit RISC core MCU for embedded automation.', 1250, 4.50, 500, 2000, 'BATCH-2026A', 'SN-MCU-90812903', NULL, 'IN_STOCK'),
('INV-002', 'ORG-001', 'BIN-A1-S1-01', 'SKU-FIB-CAT6', 'Armored Fiber Cable Cat6 (100m)', 'Heavy-duty armored single-mode optical fiber cable spool.', 85, 120.00, 30, 100, 'BATCH-2025F', 'SN-FIB-10029302', NULL, 'IN_STOCK'),
('INV-003', 'ORG-001', 'BIN-C1-S1-01', 'SKU-TMP-SEN0', 'Refrigerated Thermal Sensor Temp-01', 'Ultra-low temperature sensor for vaccine monitoring.', 140, 25.00, 150, 500, 'BATCH-2026T', 'SN-SEN-00918239', '2027-12-31 00:00:00', 'LOW_STOCK');

-- 11. Stock Transactions Seed
INSERT INTO stock_transactions (inventory_item_id, transaction_type, quantity, source_bin_id, destination_bin_id, reference_id, performed_by) VALUES 
('INV-001', 'STOCK_IN', 1250, NULL, 'BIN-B1-S1-01', 'PO-001', 'USR-INVT'),
('INV-002', 'STOCK_IN', 85, NULL, 'BIN-A1-S1-01', 'PO-002', 'USR-INVT'),
('INV-003', 'STOCK_IN', 140, NULL, 'BIN-C1-S1-01', 'PO-003', 'USR-INVT');

-- 12. Approval Rules Seed
INSERT INTO approval_rules (organization_id, module, min_amount, max_amount, required_role, sequence_order) VALUES 
('ORG-001', 'PROCUREMENT', 0.00, 50000.00, 'PROCUREMENT_MANAGER', 1),
('ORG-001', 'PROCUREMENT', 50000.01, 500000.00, 'SUPER_ADMIN', 2),
('ORG-001', 'PROCUREMENT', 500000.01, NULL, 'SUPER_ADMIN', 3);

-- 13. Audit Logs Seed
INSERT INTO audit_logs (organization_id, user_id, action, details, ip_address, device_info) VALUES 
('ORG-001', 'USR-ADMIN', 'USER_LOGIN', 'Elizabeth Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
('ORG-001', 'USR-INVT', 'STOCK_UPDATE', 'Initialized inventory items for warehouse bins', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

-- 14. In-App Notifications Seed
INSERT INTO notification_logs (user_id, title, message, type, is_read) VALUES 
('USR-ADMIN', 'Workflow Approval Required', 'PR-1002: Purchase Request for MCU-X90 (₹75,000) requires Super Admin approval.', 'APPROVAL_REQUEST', FALSE),
('USR-INVT', 'Low Stock Warning', 'SKU-TMP-SEN0: Refrigerated Thermal Sensor quantity (140) fell below reorder level (150).', 'STOCK_ALERT', FALSE);

-- 15. Purchase Requests Seed
INSERT INTO purchase_requests (id, organization_id, department_id, requester_id, item_name, quantity, estimated_cost, description, status, approval_level) VALUES
('PR-1001', 'ORG-001', 'DEP-001', 'USR-EMPL', 'Office Laptops Upgrades', 5, 250000.00, 'Laptops for engineering team onboarding', 'PENDING_APPROVAL', 1),
('PR-1002', 'ORG-001', 'DEP-001', 'USR-PROC', 'Additional Microcontroller Units', 500, 2250.00, 'Replenishment for MCU-X90 stock', 'APPROVED', 1);

-- 16. RFQs Seed
INSERT INTO rfqs (id, purchase_request_id, title, description, deadline, status) VALUES
('RFQ-1002', 'PR-1002', 'RFQ for Microcontroller Units', 'Requesting quotations for 500 units of MCU-X90 microcontrollers.', '2026-07-15 17:00:00', 'OPEN');

-- 17. Quotations Seed
INSERT INTO quotations (id, rfq_id, vendor_id, unit_price, total_price, delivery_lead_days, remarks, status) VALUES
('QT-1002-A', 'RFQ-1002', 'VEN-001', 4.20, 2100.00, 5, 'Special volume discount applied.', 'SUBMITTED');

-- 18. Customer Orders Seed
INSERT INTO customer_orders (id, organization_id, customer_name, customer_email, total_amount, status) VALUES
('ORD-2001', 'ORG-001', 'Initech Systems Corp', 'purchasing@initech.com', 45000.00, 'APPROVED');

-- 19. Order Items Seed
INSERT INTO order_items (order_id, inventory_item_id, quantity, unit_price, total_price) VALUES
('ORD-2001', 'INV-001', 1000, 4.50, 4500.00);

-- 20. Shipments & Milestones Seed
INSERT INTO shipments (id, order_id, carrier, vehicle_number, driver_name, driver_phone, route_path, estimated_arrival, status) VALUES
('SHP-3001', 'ORD-2001', 'FedEx Freight', 'FDX-7712', 'Gordon Freeman', '+19998887777', '[[32.7767,-96.7970],[35.4676,-97.5164],[39.7392,-104.9903]]', '2026-06-25 18:00:00', 'IN_TRANSIT');

INSERT INTO shipment_milestones (shipment_id, status, location, latitude, longitude, description) VALUES
('SHP-3001', 'CREATED', 'Dallas Hub', 32.7767, -96.7970, 'Shipment record created and loaded onto vehicle.'),
('SHP-3001', 'DISPATCHED', 'Dallas Hub', 32.7767, -96.7970, 'Vehicle departed the Dallas distribution warehouse.'),
('SHP-3001', 'IN_TRANSIT', 'Oklahoma City Station', 35.4676, -97.5164, 'Arrived at sorting facility for regional routing.');

-- 21. Purchase Orders Seed
INSERT INTO purchase_orders (id, purchase_request_id, vendor_id, total_amount, status, delivery_date) VALUES
('PO-001', 'PR-1002', 'VEN-001', 2100.00, 'ACCEPTED', '2026-07-20 18:00:00');
