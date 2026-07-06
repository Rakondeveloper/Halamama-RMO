# HALAMAMA OPERATIONS
## MIS BENCHMARKS ENGINE
### Functional Specification & Operational Architecture Guide
**Version:** 1.0.0  
**Target Audience:** Chief Executive Officer, Operations Directors, Warehouse Managers, Logistics Clients, and Technical Integration Teams  

---

## Table of Contents
1. **Executive Overview**
2. **Complete Order Journey**
3. **MIS Benchmark Engine Architecture**
4. **Business Time Engine**
5. **SLA Engine**
6. **Overnight Freeze Logic**
7. **Driver Workflow**
8. **Second Shift Logic**
9. **KPI Dashboard**
10. **Delayed Orders Table**
11. **Operational Gap Analytics**
12. **Delay Investigation**
13. **Dashboard Filters**
14. **Charts & Analytics**
15. **Future Expansion**
16. **Technical Architecture**
17. **End-to-End Example**
18. **CEO Summary**

---

## 1. Executive Overview

### 1.1 What is the MIS Benchmark Engine?
The **MIS Benchmark Engine** is a mission-critical business intelligence tool designed to measure, analyze, and optimize HalaMama's fulfillment and last-mile delivery operations. It provides a real-time, high-fidelity auditing system that tracks orders against rigorous operational standards known as Service Level Agreements (SLAs).

Unlike standard reports that simply count completed tasks, the MIS Benchmark Engine actively models the entire lifecycle of an order. It identifies operational gaps, exposes systemic bottlenecks, and measures efficiency using a custom-tailored **Business Time Calendar** that mirrors the actual working hours of HalaMama's logistics centers.

### 1.2 The Business Problem Solved
In modern e-commerce, raw delivery speed is no longer just a luxury—it is a baseline requirement. However, operations managers face several challenges when trying to maintain performance:
* **Overnight Distortion:** Standard clocks keep running after hours. If a customer places an order at 11:30 PM and the warehouse opens at 6:00 AM, standard analytics packages record a 6.5-hour delay before picking even starts. This distorts picker performance metrics and creates false alarms.
* **Driver Idle-Time Blame:** Often, delivery delays are blamed on drivers when the package was actually stuck in packing or waiting on a dispatch rack.
* **Lack of Root-Cause Visibility:** When a delivery misses its SLA, managers struggle to find exactly *where* the delay occurred—whether during picking, packing, assignment, departure, or transit.

### 1.3 Why SLA Monitoring is Crucial
SLA (Service Level Agreement) monitoring provides objective data to evaluate performance:
1. **Customer Retention:** Every minute saved in picking and packing directly translates to an earlier delivery at the customer’s door.
2. **Operational Efficiency:** It highlights exactly which team members, shifts, or warehouses are meeting standards and which require training or resources.
3. **Cost Control:** By reducing time wasted during handoffs (e.g., from picking to packing), HalaMama can process more orders per day with the same staff, decreasing cost-per-order.

---

## 2. Complete Order Journey

The journey of an order through HalaMama's fulfillment network is tracked through ten distinct states, each representing a handoff between teams:

```
[Customer Order]
       │
       ▼
 1. Order Created ─────────► (SLA Clock Starts)
       │
       ▼
 2. Picker Assigned
       │
       ▼
 3. Picking Started
       │
       ▼
 4. Picking Completed ─────► (Picking SLA Concludes / Packing SLA Begins)
       │
       ▼
 5. Packer Assigned
       │
       ▼
 6. Packing Completed ─────► (Packing SLA Concludes / Handoff to Logistics)
       │
       ▼
 7. Driver Assigned
       │
       ▼
 8. Driver Arrives at Hub
       │
       ▼
 9. Start Delivery ────────► (Delivery SLA Begins)
       │
       ▼
10. Delivered / Failed ────► (Delivery SLA Concludes)
```

### State Definitions:
1. **Order Created:** The customer completes checkout on Shopify or the mobile application. The order details hit the system, starting the **Picking SLA**.
2. **Picker Assigned:** A warehouse picker is assigned the order via their picking device.
3. **Picking Started:** The picker actively scans the first item from the rack.
4. **Picking Completed:** The picker scans the final item and places the batch container on the transfer conveyor. This stops the **Picking SLA** and begins the **Packing SLA**.
5. **Packer Assigned:** A packing station staff member scans the barcode to assume responsibility.
6. **Packing Completed:** The items are verified, wrapped, bagged, labeled, and placed in the shipping bin. This stops the **Packing SLA** and transitions the order to **Ready to Assign**.
7. **Driver Assigned:** A courier driver accepts the route containing this order.
8. **Driver Arrives at Hub:** The driver arrives to load their vehicle.
9. **Start Delivery:** The driver scans the packages into their vehicle and triggers **"Start Delivery"** on their mobile device. This begins the **Delivery SLA**.
10. **Delivered / Failed:** The driver marks the order as successfully delivered at the customer's doorstep or records a failed attempt. This stops the **Delivery SLA**.

---

## 3. MIS Benchmark Engine Architecture

The MIS Benchmark Engine is divided into three layers to ensure clean data processing:

```
┌───────────────────────────────────────────────┐
│              1. EVENT LISTENERS               │
│ (Captures timestamps for Created, Picked,     │
│  Packed, Started, and Delivered states)       │
└──────────────────────┬────────────────────────┘
                       │ Event Stream
                       ▼
┌───────────────────────────────────────────────┐
│           2. BUSINESS TIME ENGINE             │
│ (Subtracts overnight standstills, picking     │
│  freezes, and off-duty operational hours)      │
└──────────────────────┬────────────────────────┘
                       │ Adjusted Durations
                       ▼
┌───────────────────────────────────────────────┐
│            3. SLA EVALUATION ENGINE           │
│ (Evaluates performance, flags overshoots, and │
│  aggregates metrics for the UI)               │
└───────────────────────────────────────────────┘
```

### 3.1 Raw Time vs. Business Time
Standard reporting tools measure **Raw Time** (Wall-Clock Time):
$$\text{Raw Time} = \text{End Timestamp} - \text{Start Timestamp}$$

HalaMama uses **Business Time**, which evaluates elapsed time only during active operational windows:
$$\text{Business Time} = \text{Raw Time} - \text{Frozen Windows} - \text{Downtime}$$

If an order is packed at 12:55 AM (5 minutes before closing) and dispatch starts at 9:00 AM, the raw wait time is **485 minutes (8.1 hours)**. The Business Time Engine calculated wait time is only **5 minutes**, reflecting the true operational duration.

---

## 4. Business Time Engine

The **Business Time Engine** ensures that team performance is not penalized for off-duty hours. 

### 4.1 Operational and Frozen Hours
HalaMama runs on a 19-hour daily window:
* **Active Hours:** 06:00 AM to 01:00 AM (Next Day)
* **General Business Freeze:** 01:00 AM to 06:00 AM (5-hour pause)
* **Picking-Specific Freeze:** 12:00 AM to 06:00 AM (6-hour pause)

```
        Picking Active Hours (18h)                  Picking Freeze (6h)
┌─────────────────────────────────────────┐──────────────────────────────┐
│  06:00 AM                    12:00 AM   │ 12:00 AM            06:00 AM │
└─────────────────────────────────────────┴──────────────────────────────┘

     General Operations Active Hours (19h)          General Freeze (5h)
┌───────────────────────────────────────────┬────────────────────────────┐
│  06:00 AM                       01:00 AM  │ 01:00 AM          06:00 AM │
└───────────────────────────────────────────┴────────────────────────────┘
```

### 4.2 Multi-Day Calculations
If an order spans multiple days, the engine loops through each calendar day, identifies any overlap with freeze windows, and subtracts them.

#### Example Scenario: Multi-Day Order
* **Order Created:** Day 1 at 10:30 PM
* **Picking Completed:** Day 2 at 7:15 AM
* **SLA Type:** Picking (Freeze applies 12:00 AM to 06:00 AM)

**Calculation Steps:**
1. **Raw Elapsed Time:** 10:30 PM to 7:15 AM = **525 minutes (8.75 hours)**
2. **Identify Freeze Period:** The freeze window is 12:00 AM to 6:00 AM (**360 minutes**).
3. **Subtract Freeze:** 
$$525\text{ min} - 360\text{ min} = 165\text{ minutes}$$
4. **Active Time Spent:**
   * Day 1 (10:30 PM to 12:00 AM) = 90 minutes
   * Day 2 (06:00 AM to 07:15 AM) = 75 minutes
   * **Total Business Time:** $90 + 75 = 165$ minutes.

---

## 5. SLA Engine

The SLA Engine evaluates the active operational metrics for picking, packing, and delivery.

### 5.1 Picking SLA
* **Start Trigger:** `Order Created` timestamp.
* **Stop Trigger:** `Picking Completed` timestamp.
* **Target Benchmark:** **10 Minutes**.
* **Freeze Window:** 12:00 AM to 06:00 AM.
* **Business Rule:** Allows order creation late at night without penalizing picking crews, who finish picking activities between 12:00 AM and 1:00 AM.

### 5.2 Packing SLA
* **Start Trigger:** `Picking Completed` timestamp (the moment a picker drops items off).
* **Stop Trigger:** `Packing Completed` timestamp (items are bagged and labeled).
* **Target Benchmark:** **10 Minutes**.
* **Freeze Window:** 01:00 AM to 06:00 AM.
* **Business Rule:** Packing operations continue until the 1:00 AM close.

### 5.3 Delivery SLA
* **Start Trigger:** Driver scans the package and changes status to **"Started"** (Start Delivery).
* **Stop Trigger:** Driver updates status to **"Delivered"** or **"Delivery Failed"**.
* **Target Benchmark:** **210 Minutes (3.5 Hours)**.
* **Freeze Window:** N/A (Drivers operate during active daylight routes).
* **Business Rule:** The clock does not start when a driver is assigned or during route creation, as vehicles may wait at the hub for loading.

---

## 6. Overnight Freeze Logic

The overnight freeze protects fulfillment metrics when the warehouse is closed.

```
                         1:00 AM               6:00 AM
 Warehouse Open             │   Warehouse Closed  │        Warehouse Open
────────────────────────────┼─────────────────────┼────────────────────────────►
   Active Clock             │    Clock Paused     │        Clock Resumed
```

### Scenario: Packing Handoff Over Closing
* **Picking Completed:** 12:45 AM (15 minutes before closing)
* **Packing Completed:** 06:10 AM (10 minutes after opening)

**Analysis:**
* **Raw Wall-Clock Elapsed Time:** 5 hours and 25 minutes (**325 minutes**).
* **Overnight Freeze Applied:** 01:00 AM to 06:00 AM (300 minutes removed).
* **Business Duration:** 
$$\text{Raw Time } (325\text{ min}) - \text{Freeze } (300\text{ min}) = 25\text{ minutes}$$
* **Result:** The system records a business duration of **25 minutes** (15 minutes of active work before closing + 10 minutes of active work after opening).

---

## 7. Driver Workflow

The last-mile delivery SLA isolates driver travel times from warehouse processing delays.

```
   8:45 AM              9:00 AM             9:15 AM                 11:30 AM
┌───────────┐        ┌───────────┐       ┌───────────┐            ┌───────────┐
│  Driver   ├───────►│  Driver   ├──────►│   Start   ├───────────►│  Parcel   │
│ Assigned  │        │  Arrives  │       │ Delivery  │            │ Delivered │
└─────┬─────┘        └─────┬─────┘       └─────┬─────┘            └─────┬─────┘
      │                    │                   │                        │
      └─────────┬──────────┘                   └───────────┬────────────┘
         Delivery SLA is Frozen                     Delivery SLA is Active
             (Idle Buffer)                              (Elapsed: 2.25h)
```

### Why Driver Assignment is NOT the Start of Delivery
Drivers are often assigned to routes in batches (e.g., at 8:45 AM), but they must wait to load their vehicles and complete dispatch paperwork.
* **If delivery SLA started at Assignment:** The delivery timer would run while the driver is still at the warehouse loading dock, penalizing the driver's on-road metrics.
* **Halamama Solution:** Pre-delivery time remains frozen. The delivery SLA begins only when the driver scans the parcels and marks the run as **"Started"**, measuring actual road transit time.

---

## 8. Second Shift Logic

HalaMama operates a multi-trip dispatcher strategy, maximizing driver utilization throughout the day.

```
 09:00 AM                              01:00 PM             04:00 PM
┌─────────────────────────────────────┬───────────────────────────┐
│            TRIP 1                   │          TRIP 2           │
│ (Dispatch 9 AM, Return by 1 PM)     │ (Dispatch 1 PM to 4 PM)   │
└─────────────────────────────────────┴───────────────────────────┘
```

* **Trip 1 (Morning Run):** Dispatched starting at 09:00 AM. Drivers complete their runs and return to the hub by approximately 01:00 PM.
* **Trip 2 (Afternoon Run):** Dispatched between 01:00 PM and 04:00 PM.
* **Tracking SLA:** The engine assigns a distinct SLA calculation for each trip. If a driver returns from Trip 1 at 1:00 PM and starts Trip 2 at 1:30 PM, the system resets the SLA target and measures Trip 2 independently, preventing cumulative delay tracking.

---

## 9. KPI Dashboard

The **MIS Benchmarks Dashboard** displays three main KPI cards:

```
┌───────────────────────────────────┐  ┌───────────────────────────────────┐  ┌───────────────────────────────────┐
│        PICKING PERFORMANCE        │  │        PACKING PERFORMANCE        │  │       DELIVERY PERFORMANCE        │
│              100.0%               │  │               0.0%                │  │               0.0%                │
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ │  │ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ │  │ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ │
│ 1 met                    0 missed │  │ 0 met                    1 missed │  │ 0 met                    0 missed │
│                                   │  │                                   │  │                                   │
│ AVG TIME             TOTAL ORDERS │  │ AVG TIME             TOTAL ORDERS │  │ AVG TIME             TOTAL ORDERS │
│ 8 min                           1 │  │ 12 min                          1 │  │ 0 min                           0 │
└───────────────────────────────────┘  └───────────────────────────────────┘  └───────────────────────────────────┘
```

### 9.1 SLA Met Percentage Formulas
$$\text{SLA Met \%} = \left( \frac{\text{Orders Meeting Target}}{\text{Total Orders Completed}} \right) \times 100$$

### 9.2 Average Time Formula
$$\text{Average Time} = \frac{\sum \text{Business Duration of Completed Orders}}{\text{Total Orders Completed}}$$

---

## 10. Delayed Orders Table

Orders that miss their benchmark target are logged in the **Delayed Orders Table** to help managers identify and investigate bottlenecks.

| Column | Data Type | Description | Business Purpose |
| :--- | :--- | :--- | :--- |
| **ORDER** | Link / String | The unique Shopify/LMD Order ID (e.g., `HM99005`) | Direct click-through to view customer notes, addresses, and history |
| **OUTLET / WH** | String | The originating facility code (e.g., `F01`, `F02`, `MWO`) | Identifies localized warehouse issues |
| **ASSIGNED TO** | String | Name of the staff member responsible | Pinpoints individual training or productivity issues |
| **DURATION** | Duration (min) | The calculated business time spent | Measures the actual time taken to complete the task |
| **BENCHMARK** | Duration (min) | The SLA target (e.g., `10m`, `210m`) | Provides context for the target timeframe |
| **OVERSHOOT** | Factor (Multiplier) | How many times the order exceeded the target | Sorts and highlights the most severe delays |
| **REASON** | String | The system-inferred bottleneck reason | Automates the sorting of delays (e.g., "No packer assigned") |
| **DETAILS** | Link | Link to the order's tracking details | Allows managers to view the complete order lifecycle |

### 10.1 The Overshoot Multiplier Formula
$$\text{Overshoot Factor} = \frac{\text{Business Duration}}{\text{SLA Benchmark Target}}$$

For example, if an order takes 30 minutes to pick (SLA target is 10 minutes), the overshoot factor is **$3.0\text{x}$**, indicating the task took 3 times longer than the benchmark.

---

## 11. Operational Gap Analytics

The gap analytics cards measure the transfer handoff times between fulfillment stages.

```
┌────────────────────────────────────────────────────────┐
│               OPERATIONAL GAP ANALYTICS                │
├────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────┐ ┌───────────────────┐ │
│ │  PICKING COMPLETE TO PACKING  │ │  PACKING TO DRIVER │ │
│ │  Avg: 7 min    Longest: 7 min│ │  Avg: 0m  Long: 0m│ │
│ └──────────────────────────────┘ └───────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 11.1 Picking Complete → Packing Start (Waiting Time)
This metrics measures how long picked items sit in queue before packing begins:
* **The Gap:** `Packing Started` time - `Picking Completed` time.
* **Why it Matters:** A high average wait time indicates a bottleneck at the packing tables, suggesting a need for more packing staff.

### 11.2 Packing Complete → Driver Assignment (Idle Time)
This metrics measures the time finished packages wait to be assigned to couriers:
* **The Gap:** `Driver Assigned` time - `Packing Completed` time.
* **Why it Matters:** High idle times indicate courier shortages, routing delays, or dispatch scheduling issues.

---

## 12. Delay Investigation

Managers use the MIS Benchmarks Dashboard to identify and address common operational bottlenecks:

```
                          ┌──────────────────────────┐
                          │     SLA Delay Flagged    │
                          └─────────────┬────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
     [Overshoot Factor > 5x]                       [Operational Gap > 30m]
                 │                                             │
                 ▼                                             ▼
      Identify Staff Performance                  Expose Handoff Bottleneck
  (Slow pickers, lack of training)           (Congested staging areas, packing backlog)
```

1. **Slow Pickers / Packers:** Identified by filtering by the assigned staff member in the delayed orders table.
2. **Warehouse Congestion:** High overshoot factors at specific outlets highlight local inventory organization or equipment issues.
3. **Fulfillment Bottlenecks:** Spikes in picking-to-packing gap times signal a need to balance staff allocations between picking and packing.
4. **Transit & Logistics Backlogs:** High packing-to-driver gap times help logistics managers coordinate courier arrivals with packing completion rates.

---

## 13. Dashboard Filters

The filters allow managers to isolate operational performance metrics:
1. **Warehouse Filter:** Switch between "All Warehouses" and individual hubs (e.g., `F01`, `F02`).
2. **Date Range Filter:** Select specific operational windows to monitor performance trends.
3. **Dynamic Recalculation:** Adjusting the filters automatically updates all KPI stats, progress bars, delayed order tables, and gap analytics cards.

---

## 14. Charts & Analytics

The visual analytics section provides data visualization for daily operations:

* **SLA Trend Charts:** Tracks daily SLA compliance rates over time to evaluate operational improvements.
* **Hourly Processing Heatmap:** Maps order completions by hour to identify peak volume periods and align staffing levels.
* **Delay Distribution Breakdown:** Displays the share of delays caused by picking, packing, or delivery issues, helping prioritize process improvements.
* **Outlet Performance Leaderboard:** Compares different fulfillment hubs to share best practices from top-performing centers.

---

## 15. Future Expansion

The MIS Benchmark Engine is designed as a foundation for future analytics modules:

```
                        ┌─────────────────────────┐
                        │  Centralized SLA Engine │
                        └────────────┬────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
 ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
 │ Picker/Packer MIS │     │    Driver MIS     │     │   Executive MIS   │
 │ (Productivity)    │     │   (Route SLAs)    │     │ (Profitability)   │
 └───────────────────┘     └───────────────────┘     └───────────────────┘
```

1. **Picker/Packer Performance MIS:** Adds individual leaderboards, error rate tracking, and average items-per-minute metrics.
2. **Driver MIS:** Measures individual courier transit times, delivery success rates, and customer service ratings.
3. **Executive Dashboard:** Connects operational performance metrics with profitability indicators, such as cost-per-delivery and order density.
4. **Predictive SLA Alerts:** Uses historical data to flag orders at risk of breaching SLAs, allowing managers to intervene early.

---

## 16. Technical Architecture

The technical architecture is built for scalability and performance:

```
 ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
 │     EVENT ENGINE     ├─────►│ BUSINESS TIME ENGINE ├─────►│      SLA ENGINE      │
 │ (Listen to Timeline) │      │ (Subtract Freezes)   │      │ (Evaluate Statuses)  │
 └──────────────────────┘      └──────────────────────┘      └──────────┬───────────┘
                                                                        │
 ┌──────────────────────┐      ┌──────────────────────┐                 │
 │    MIS DASHBOARD     │◄─────┤    DASHBOARD API     │◄────────────────┘
 │  (UI Render Engine)  │      │ (React Query Cache)  │
 └──────────────────────┘      └──────────────────────┘
```

* **Event Listeners:** Extracts and parses chronological timestamps from order timeline events.
* **Memoization & Caching:** Heavy business duration calculations are cached in the browser using React `useMemo` to keep the interface fast and responsive.
* **Clean Data Contracts:** The separation between the data provider and the frontend components allows developers to transition from mock data to live API feeds without redesigning the UI.

---

## 17. End-to-End Example

### Walkthrough of Order #HM99042

This case study shows how an order is tracked as it moves through the fulfillment process:

```
  08:00            08:11                 08:19                   09:09               10:42
┌───────┐        ┌───────┐             ┌───────┐               ┌───────┐           ┌───────┐
│ Order │        │ Pick  │             │ Pack  │               │ Start │           │ Order │
│ Created───────►│Complete────────────►│Complete──────────────►│Delivery──────────►│Delivered
└───────┘        └───────┘             └───────┘               └───────┘           └───────┘
    │  Picking SLA  │    Packing SLA       │     Driver Buffer     │    Delivery SLA   │
    │  (11 minutes) │    (8 minutes)       │    (SLA is Frozen)    │    (93 minutes)   │
```

#### Order Lifecycle Events:
* **08:00 AM:** Order Created. The picking timer starts.
* **08:05 AM:** Picker Assigned & Picking Starts.
* **08:11 AM:** Picking Completed. The picking timer stops.
  * **Picking SLA Duration:** 11 minutes (Target: 10 minutes).
  * **Result:** **FAILED (Overshoot: 1.1x)**.
* **08:14 AM:** Packing Starts.
* **08:19 AM:** Packing Completed and order is marked "Ready to Assign".
  * **Packing SLA Duration:** 8 minutes (Target: 10 minutes).
  * **Result:** **PASS**.
* **09:02 AM:** Driver Assigned.
* **09:08 AM:** Driver Collects Parcel at the hub.
* **09:09 AM:** Driver leaves the hub and triggers "Start Delivery". The delivery timer starts.
* **10:42 AM:** Order Delivered. The delivery timer stops.
  * **Delivery SLA Duration:** 93 minutes (Target: 210 minutes).
  * **Result:** **PASS**.

#### Summary Report:
* **Total Raw Duration:** 2 hours and 42 minutes (162 minutes).
* **Fulfillment Metrics Summary:**
  * Picking SLA: **FAIL** (11 minutes vs. 10-minute target)
  * Packing SLA: **PASS** (8 minutes vs. 10-minute target)
  * Delivery SLA: **PASS** (93 minutes vs. 210-minute target)
* **Performance Analysis:** This order failed the picking benchmark by 1 minute, but met both the packing and delivery SLAs. Managers can review the picking timeline to check for item location or barcode issues.

---

## 18. CEO Summary

### 18.1 Business Value
The **MIS Benchmark Engine** provides a clear view of HalaMama's operational performance. By separating calculations into distinct stages (picking, packing, and delivery) and adjusting for warehouse hours, the engine provides managers with accurate data to evaluate efficiency.

### 18.2 Operational Impact
* **Clear Accountability:** Distinguishes between warehouse processing times and driver transit times, helping managers assign tasks and coordinate resources effectively.
* **Resource Optimization:** Identifies specific bottlenecks in the fulfillment chain, helping managers decide where to allocate staff or focus training efforts.
* **Customer Retention:** Pinpoints the operational delays that affect delivery times, helping the team address root causes and maintain a reliable customer experience.
