import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2 } from "lucide-react";

/* ── Form field wrapper ── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── Toggle row ── */
function ToggleRow({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}

const INPUT_CLS = "w-full h-10 px-3.5 rounded-xl bg-muted/60 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-background transition-colors";

export function SystemSettings() {
  const [columns, setColumns] = useState<Record<string, boolean>>({
    TAT: true,
    "Customer Info": true,
    City: false,
    "Sales Channel": true,
    "Items Count": true,
    "Status Badge": true,
    "Returns Info": true,
    Zone: false,
    Coordinator: false,
    Driver: false,
  });

  const toggleCol = (key: string) =>
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-8">
      {/* ── System Settings ── */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5">
        <div>
          <h2 className="text-lg font-bold">System Settings</h2>
          <p className="text-sm text-muted-foreground">Manage store connection and branding configuration</p>
        </div>

        <Field label="Shopify Store URL">
          <div className="flex flex-col sm:flex-row gap-2">
            <input id="shopify-url" defaultValue="halamama.myshopify.com" className={INPUT_CLS + " flex-1"} />
            <button className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity shrink-0 w-full sm:w-auto">
              <Link2 className="h-4 w-4" />
              Connect With Pinpointy
            </button>
          </div>
        </Field>

        <Field label="Shopify Access Token">
          <input id="shopify-token" type="password" defaultValue="shpat_xxxxxxxxxxxxxxxxx" className={INPUT_CLS} />
        </Field>

        <Field label="Webhooks Secret Key">
          <input id="webhooks-key" type="password" defaultValue="whsec_xxxxxxxxxxxxxxxxx" className={INPUT_CLS} />
        </Field>

        <Field label="Logo URL">
          <input id="logo-url" defaultValue="https://halamama.com/cdn/shop/files/halamama_green.svg" className={INPUT_CLS} />
        </Field>

        <Field label="Logo Background Color">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg border border-border bg-white" />
            <input id="logo-bg" defaultValue="#ffffff" className={INPUT_CLS + " max-w-[140px]"} />
          </div>
        </Field>

        <Field label="Web App Title">
          <input id="webapp-title" defaultValue="OMS Halamama" className={INPUT_CLS} />
        </Field>

        <Field label="Date Format" hint="Display format for dates across the application">
          <input id="date-format" defaultValue="MMM DD | HH:mm" className={INPUT_CLS} />
        </Field>

        {/* Warehouse Mode toggle */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div>
            <div className="text-sm font-semibold">Warehouse Mode</div>
            <div className="text-xs text-muted-foreground">Enable split picker/packer workflow. Required for Picker and Packer roles.</div>
          </div>
          <Switch defaultChecked />
        </div>
      </section>

      {/* ── Feature Flags ── */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-1">
        <div className="mb-3">
          <h2 className="text-lg font-bold">Feature Flags</h2>
          <p className="text-sm text-muted-foreground">Toggle features on/off for this client tenant</p>
        </div>
        <ToggleRow label="Force Driver Assignment" description="Enables accept/reject for drivers — they go straight to started/completed" defaultChecked />
        <ToggleRow label="Auto Fulfill on Complete" description="Auto-fulfills the order in Shopify when driver marks completed" />
        <ToggleRow label="Location-Based Sorting" description="Sorts driver order list by proximity (requires driver GPS)" defaultChecked />
        <ToggleRow label="Driver Delivery Method" description="Lets drivers select a delivery method (hand delivery, left at door, etc.)" defaultChecked />
        <ToggleRow label="Require Rejection Reason" description="Makes rejection reason mandatory when driver/outlet rejects" defaultChecked />
        <ToggleRow label="Notify Incomplete Delivery" description="Sends push notification to outlet & admins when driver rejects" defaultChecked />
        <ToggleRow label="Single Fulfillment Location" description="Auto-allocates all line items to the default outlet on order create" defaultChecked />
        <ToggleRow label="Notify Order Started" description="Sends push notification to outlet & admins when driver starts trip" defaultChecked />
        <ToggleRow label="Admin Rejection Reasons" description="Forces selection from a predefined list of rejection reasons" defaultChecked />
        <ToggleRow label="Collect Returns" description="Enables the returns/replacement collection module" />
        <ToggleRow label="Zone-Based Allocation" description="Enables geographic zone management & zone-based driver allocation" defaultChecked />
      </section>

      {/* ── Order List Columns ── */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
        <div>
          <h2 className="text-lg font-bold">Order List Columns</h2>
          <p className="text-sm text-muted-foreground">Select which columns should be visible in the order list table</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(columns).map(([key, checked]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none text-sm">
              <Checkbox checked={checked} onCheckedChange={() => toggleCol(key)} />
              {key}
            </label>
          ))}
        </div>
      </section>

      {/* ── Default Outlet ── */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
        <Field label="Default Outlet" hint="All line items will be auto-allocated to this outlet on order create.">
          <Select defaultValue="f01">
            <SelectTrigger id="default-outlet" className="rounded-xl h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="f01">F01 - Fulfillment Center Hilal</SelectItem>
              <SelectItem value="f02">F02 - Al Wakrah Branch</SelectItem>
              <SelectItem value="f03">F03 - Al Rayyan Branch</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <button
          id="save-settings-btn"
          className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity"
        >
          Save Settings
        </button>
      </section>
    </div>
  );
}
