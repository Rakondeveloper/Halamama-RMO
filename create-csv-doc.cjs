const fs = require('fs');
const path = require('path');

const csvData = [
  [
    "Change ID",
    "Date",
    "Feature Name",
    "Component / Area",
    "File Name / Path",
    "Change Type",
    "User-Friendly Description",
    "Backend & Data Contract Impact",
    "Verification Status"
  ],
  [
    "CHG-001",
    "2026-07-30",
    "Replace Coordinator with Comment",
    "Orders Table Header",
    "src/components/orders/OrderTable.tsx",
    "Feature Update",
    "Replaced the static 'Coordinator' column header in the Orders table with an interactive 'Comment' column header.",
    "UI column header update. No API breaking change.",
    "Verified (Build & Pushed)"
  ],
  [
    "CHG-002",
    "2026-07-30",
    "Interactive Comment Cell & Popover",
    "Orders Table Row",
    "src/components/orders/OrderTableRow.tsx",
    "Feature Update",
    "Added a popover box allowing operations admins to add new comments, edit existing comments, or delete comments with toast feedback.",
    "Sends comment payload to API. Displays updated comment text and editor badge in table row.",
    "Verified (Build & Pushed)"
  ],
  [
    "CHG-003",
    "2026-07-30",
    "Spacebar Typing Fix in Comment Textarea",
    "Orders Table Row",
    "src/components/orders/OrderTableRow.tsx",
    "Bug Fix",
    "Fixed an issue where pressing the Spacebar while typing in the comment box was swallowed by table row shortcuts. Now spaces type normally.",
    "Pure frontend event handler fix (added e.stopPropagation).",
    "Verified (Build & Pushed)"
  ],
  [
    "CHG-004",
    "2026-07-30",
    "Static Operations Admin Identity Display",
    "Orders Table Row Popover",
    "src/components/orders/OrderTableRow.tsx",
    "Enhancement",
    "Removed the manual admin dropdown selection. The comment popover now automatically records and displays the active operations admin name.",
    "Comment mutation payload includes active admin identity (custom_comment_admin).",
    "Verified (Build & Pushed)"
  ],
  [
    "CHG-005",
    "2026-07-30",
    "Order Comment Data Model & Metadata",
    "Core Order Types",
    "src/lib/orders.ts",
    "Data Model Update",
    "Added 'comment' string and 'commentMeta' object (editedBy, editedAt) to the Order interface.",
    "Standardized comment object structure across mock data, sync, and API mappers.",
    "Verified (Build & Pushed)"
  ],
  [
    "CHG-006",
    "2026-07-30",
    "Local Storage & Multi-Tab Sync",
    "Sync Service Layer",
    "src/lib/sync.ts",
    "State & Sync",
    "Added helper functions (updateOrderComment, deleteOrderComment) to persist comment changes in local storage and broadcast to open tabs.",
    "Ensures comments remain saved across page refreshes and multi-tab sessions in demo mode.",
    "Verified (Build & Pushed)"
  ],
  [
    "CHG-007",
    "2026-07-30",
    "API Service Integration Methods",
    "API Layer",
    "src/lib/api/services.ts",
    "API Integration",
    "Added updateOrderComment and deleteOrderComment methods to ordersApi service with ERPNext endpoint integration placeholders.",
    "Will issue PUT /api/resource/Sales Order/{orderId} with { custom_comment, custom_comment_admin } when real API is connected.",
    "Verified (Build & Pushed)"
  ],
  [
    "CHG-008",
    "2026-07-30",
    "React Query Mutation Hooks",
    "Data Fetching Hooks",
    "src/hooks/useOrders.ts",
    "State Management",
    "Exported useUpdateOrderComment and useDeleteOrderComment hooks that automatically refresh order data upon mutation.",
    "Automatically triggers re-fetch of order detail and list queries.",
    "Verified (Build & Pushed)"
  ],
  [
    "CHG-009",
    "2026-07-30",
    "System Settings Column Toggle",
    "Settings Module",
    "src/components/settings/SystemSettings.tsx",
    "Settings Update",
    "Updated column visibility options in System Settings from 'Coordinator' to 'Comment'.",
    "Settings state toggle updated to reflect Comment column.",
    "Verified (Build & Pushed)"
  ],
  [
    "CHG-010",
    "2026-07-30",
    "Invoice Printable Styling & Layout",
    "Orders Print Dialog",
    "src/components/orders/PrintInvoiceDialog.tsx",
    "UI Optimization",
    "Enhanced thermal receipt & print dialog layout, column alignment, and payment summary blocks.",
    "Pure UI print styling enhancement.",
    "Verified (Build & Pushed)"
  ],
  [
    "CHG-011",
    "2026-07-30",
    "Calendar Aggregate Team View",
    "Calendar Module",
    "src/routes/calendars.tsx",
    "Feature Update",
    "Added 'All Teams' option to view calendar appointments across all teams without requiring location selection.",
    "Calendar API queries will support aggregate team filtering.",
    "Verified (Build & Pushed)"
  ],
  [
    "CHG-012",
    "2026-07-30",
    "Backend Developer Documentation Rule",
    "Project Customizations",
    ".agents/AGENTS.md",
    "Documentation Rule",
    "Created mandatory project rule requiring file-by-file technical breakdowns for backend developers on every git commit.",
    "Ensures ongoing backend clarity for API integration.",
    "Verified (Active Rule)"
  ]
];

function escapeCsvCell(cell) {
  if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
    return '"' + cell.replace(/"/g, '""') + '"';
  }
  return cell;
}

const csvContent = "\uFEFF" + csvData.map(row => row.map(escapeCsvCell).join(",")).join("\n");
const outputPath = path.join(__dirname, 'Halamama_Dashboard_Changes_Documentation.csv');

fs.writeFileSync(outputPath, csvContent, 'utf8');
console.log(`CSV documentation generated successfully at: ${outputPath}`);
