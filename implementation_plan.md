# Implementation Plan - Remove Channel and Returns from the New Tab on Order Page

This plan outlines the changes required to remove the **Channel** and **Returns** columns from the **New** tab view on the Order management page (`OrderTable` and `OrderCard` components).

## User Review Required

> [!NOTE]
> The **Channel** and **Returns** columns will remain visible on other applicable tabs (e.g., *All*, *Unfulfilled*, *In Delivery*, etc.), and will only be hidden when the active tab is **New** (`activeTab === "New"`).

## Proposed Changes

### Order Table & Card Components

#### [MODIFY] [OrderTable.tsx](file:///c:/Ansil/HalaMama%20Dashboard/hub-stream-flow-main/src/components/orders/OrderTable.tsx)
- Update table header conditions:
  - Add `activeTab !== "New"` to the `Channel` `<th>` header render condition.
  - Add `activeTab !== "New"` to the `Returns` `<th>` header render condition.

#### [MODIFY] [OrderTableRow.tsx](file:///c:/Ansil/HalaMama%20Dashboard/hub-stream-flow-main/src/components/orders/OrderTableRow.tsx)
- Update table row cell conditions:
  - Add `activeTab !== "New"` to the `Channel` `<td>` cell render condition.
  - Add `activeTab !== "New"` to the `Returns` `<td>` cell render condition.
- Update `colSpanCount` calculation:
  - Account for `activeTab === "New"` by subtracting 2 from `colSpanCount` so expanded details span the updated table width (11 columns).

#### [MODIFY] [OrderCard.tsx](file:///c:/Ansil/HalaMama%20Dashboard/hub-stream-flow-main/src/components/orders/OrderCard.tsx)
- Conditionally render the Channel badge only when `activeTab !== "New"`.

#### [MODIFY] [OrderList.tsx](file:///c:/Ansil/HalaMama%20Dashboard/hub-stream-flow-main/src/components/orders/OrderList.tsx)
- Pass `activeTab={activeTab}` prop to the `<OrderCard>` components rendered in grid and mobile list views.

---

## Backend Developer Notes (API & Data Model Impact)

1. **Data Model Structure**:
   - The underlying `Order` type definition in `src/lib/orders.ts` (`order.channel` and `order.returns`/`order.returnItems`) remains completely unchanged.
   - The API mapping in `src/lib/api/mappers.ts` will continue to map `custom_channel` and return status, preserving full data availability for detail dialogs/views.

2. **UI & State Structure**:
   - Tab filtering logic in `matchesLegacyTab` continues to operate on order status `"New"`.
   - Table column layout count dynamically reduces from 13 columns to 11 columns specifically when `activeTab === "New"`.

---

## Verification Plan

### Manual Verification
1. Open the dashboard in browser.
2. Navigate to the **Orders** page and select the **New** tab.
3. Verify that the table header no longer displays **CHANNEL** or **RETURNS** columns.
4. Verify table row alignment and check that expanding an order row spans full width cleanly without horizontal layout offset.
5. Switch to other tabs (e.g. **All**, **Unfulfilled**) to verify **CHANNEL** and **RETURNS** columns are still present where expected.
