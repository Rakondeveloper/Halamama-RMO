# Fixing MIS Benchmarks Refresh Button

This plan resolves the issue where the Refresh button on the MIS Benchmarks page does not fetch new data, especially in live mode, due to the component bypassing React Query's fetch cache and relying entirely on a static local storage reader.

## User Review Required

> [!NOTE]
> - The `MisDataProvider` interface will be extended to accept an optional `orders` list.
> - The `MisBenchmarksPage` component will use the `useOrders` hook to load/refresh the orders list.
> - A spinning loader animation will be added to the Refresh button to show when refetching is in progress.

## Proposed Changes

### MIS Module Types

#### [MODIFY] [mis-types.ts](file:///c:/Ansil/HalaMama%20Dashboard/hub-stream-flow-main/src/lib/mis/mis-types.ts)
- Update `MisDataProvider` interface methods (`getOrderMetrics`, `getSummary`, `getDelayedOrders`) to accept an optional `orders?: Order[]` parameter.

### MIS Data Service

#### [MODIFY] [mis-data-service.ts](file:///c:/Ansil/HalaMama%20Dashboard/hub-stream-flow-main/src/lib/mis/mis-data-service.ts)
- Modify `getFilteredOrders` to accept `customOrders?: Order[]`. If provided, use it instead of calling `getSharedOrders()`.
- Update `MockMisDataProvider` implementation to accept and pass through the optional `orders` parameter to `getFilteredOrders`.
- Update `getDelayedOrders` to search for original orders in the passed-in list if available.

### MIS Benchmarks Page Route

#### [MODIFY] [mis-benchmarks.tsx](file:///c:/Ansil/HalaMama%20Dashboard/hub-stream-flow-main/src/routes/mis-benchmarks.tsx)
- Import `useOrders` from `@/hooks/useOrders` and `cn` if not imported (it is imported).
- In `MisBenchmarksPage`, fetch orders with `const { data: allOrders = [], refetch, isRefetching } = useOrders();`.
- Pass `allOrders` to `misDataProvider.getSummary` and `misDataProvider.getDelayedOrders`.
- Update `handleRefresh` to call `await refetch()`.
- Add `animate-spin` class to the `RefreshCw` icon when `isRefetching` is true and disable the button.

---

## Verification Plan

### Automated / Build Verification
- Verify that the application builds and compiles successfully.

### Manual Verification
1. Navigate to the **MIS Benchmarks** page.
2. Click the **Refresh** button and verify that the icon spins during the fetch and the page displays updated statistics.
