# Enterprise Supply Chain Management (SCM) Platform

A production-ready, enterprise-grade Supply Chain Management (SCM) system. This platform is designed to manage multi-tenant logistics, procurement requisitioning, vendor portals, warehouse allocations (with capacity heatmaps), customer sales checkout, carrier milestones tracking (with GPS route simulation), and AI-driven telemetry (anomaly detection, demand forecasting, and NLP chat assistants).

---

## 🚀 Technology Stack

### Frontend
- **Angular 20+** (Standalone Components, Routing, Signals state management)
- **Tailwind CSS v4** (Modern utility styles, custom variables dark/light mode themes)
- **Angular Material** (Overlay panels, date pickers, form inputs)
- **ApexCharts** (`ng-apexcharts` for interactive KPIs and financial summaries)
- **Lucide Icons** (Premium iconography)

### Backend
- **Spring Boot 3.4.0** (Web, Security, JPA, Validation)
- **Java 21** (LTS compilation features)
- **Spring Security** (Stateless JWT token authentication, CORS filters)
- **Spring Data JPA** (SQL transactions)
- **Apache Kafka** (Event-driven publishers and listener consumers)
- **Redis Caching** (Telemetry cache layer with local concurrent map fallbacks)
- **PostgreSQL & H2 Database** (Hybrid relational persistence)
- **OpenAPI / Swagger** (`springdoc-openapi` for API specifications)

### DevOps & Infrastructure
- **Docker & Docker Compose** (DB, Redis, Kafka orchestration)
- **GitHub Actions** (Automated CI/CD build scripts)

---

## 🏛️ System Architecture

```
                  ┌───────────────────────────────┐
                  │      Angular 20 Frontend      │
                  └──────────────┬────────────────┘
                                 │ REST APIs / JWT
                  ┌──────────────▼────────────────┐
                  │    Spring Boot 3 Backend      │
                  └────────┬──────────────┬───────┘
                           │              │
        ┌──────────────────▼────┐   ┌─────▼────────────────┐
        │     PostgreSQL / H2   │   │        Redis         │
        │   Transactional DB    │   │  Cache / Rate-Limit  │
        └───────────────────────┘   └──────────────────────┘
                           │
        ┌──────────────────▼────┐   ┌──────────────────────┐
        │     Apache Kafka      │   │    AI Heuristics     │
        │       Event Bus       │   │ Forecasts/Anomalies  │
        └───────────────────────┘   └──────────────────────┘
```

---

## ⚙️ Setup & Execution Instructions

The project features a **hybrid execution mode**. If you run it locally without Docker, it will auto-detect unreachable brokers (Kafka/Redis/PostgreSQL) and seamlessly fall back to local H2 in-memory databases, memory caches, and event logs, making the codebase compile and run instantly on any host machine.

### Infrastructure (Docker Compose)
To spin up the SCM databases, caches, and event streaming brokers:
```bash
docker-compose up -d
```

### Backend (Spring Boot)
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Compile and run the Spring Boot server:
   ```bash
   mvn spring-boot:run
   ```
3. The backend starts on `http://localhost:8080/api`.
4. Inspect API contracts via Swagger: `http://localhost:8080/api/swagger-ui/index.html`

### Frontend (Angular)
1. Navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the client development server:
   ```bash
   npm run start
   ```
4. The client launches on `http://localhost:4200`.

5. for database access 
 Open H2 Console in Your Browser
Navigate to the following URL: 👉 http://localhost:8080/api/h2-console

6.You can confirm the backend is up and running at any time by opening this URL in your web browser: 👉 http://localhost:8080/api/v3/api-docs

---

## 🏁 SCM Walkthrough Scenarios

Open `http://localhost:4200` to test these scenarios:

### Scenario 1: User Log In & Profile Prefills
1. At the login portal, click one of the **Quick Demo Profile** buttons (e.g. *Elizabeth Admin* or *John Procurement*).
2. The credentials auto-populate. Click **Secure Sign In**.
3. The layout displays a collapsible sidebar and dashboard stats matching the role permissions.
4. Toggle the **Sun/Moon icon** at the top right to watch the theme switch dynamically between dark/light designs.

### Scenario 2: Procurement Lifecycle & RFQs
1. Log in as **Elizabeth Admin**. Go to **Procurement**.
2. Click **+ New Request** to draft a Purchase Request (e.g. "Armored spools", Quantity `200`, Cost `150000`). Submit it.
3. The request appears as `PENDING_APPROVAL`. Click **Approve**. The status changes to `APPROVED`.
4. Click **Launch RFQ**. This automatically moves the PR to `RFQ_STAGE` and starts an open bidding campaign under **RFQ Campaigns**.
5. Log in as a **Vendor** (or switch views) and submit bids, or inspect bids directly.
6. Under **Compare Bids**, click **Award Contract & Generate PO** for the best quotation.
7. Under **Purchase Orders**, observe the generated PO in `PENDING_ACCEPTANCE` state, awaiting logistics load.

### Scenario 3: Customer Checkout & Stock Reservation
1. Go to **Order Fulfillment**.
2. Input customer checkout parameters (customer name, email, parts select, quantity).
3. Click **Authorize Checkout**.
4. The system automatically reserves stock from the inventory database. Go to **Inventory** to verify the stock level has been deducted. If the quantity falls below the reorder level, a **Low Stock Warning** flag turns red and posts an in-app alert.

### Scenario 4: GPS Route Transit Simulation
1. Go to **Logistics Fleet**.
2. Select the shipment mapped to the customer order (e.g., `SHP-3001`).
3. View the **Live GPS Tracking Simulation** map. A pulsing indicator represents the carrier.
4. Click **Simulate Next Stop**. The status transitions (e.g., `IN_TRANSIT` ➔ `OUT_FOR_DELIVERY`), appending tracking timeline milestones and advancing the red vehicle indicator along the coordinates route!

### Scenario 5: SCM AI Conversational Assistant
1. Go to **SCM AI Assistant**.
2. Type queries in natural language:
   - Check stock levels: `"check stock MCU"` (returns real-time bin details)
   - Inspect supplier performance: `"Apex score"` (returns scorecards metrics)
   - Generate demand forecasts: `"forecast MCU"` (performs linear regression and draws projection lists)
   - Track carrier shipments: `"track SHP-3001"` (returns milestone status)
