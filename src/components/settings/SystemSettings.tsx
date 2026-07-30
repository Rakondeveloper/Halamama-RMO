import { useState, useRef } from "react";
import { Link2, CheckCircle2 } from "lucide-react";

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

const INPUT_CLS = "w-full h-10 px-3.5 rounded-xl bg-muted/60 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-background transition-colors";

const SETTINGS_KEY = "hm_system_settings";

export function SystemSettings() {
  const [columns] = useState<Record<string, boolean>>({
    TAT: true,
    "Customer Info": true,
    City: false,
    "Sales Channel": true,
    "Items Count": true,
    "Status Badge": true,
    "Returns Info": true,
    Zone: false,
    Comment: true,
    Driver: false,
  });
  const [saved, setSaved] = useState(false);

  const shopifyUrlRef = useRef<HTMLInputElement>(null);
  const shopifyTokenRef = useRef<HTMLInputElement>(null);
  const webhooksKeyRef = useRef<HTMLInputElement>(null);
  const logoUrlRef = useRef<HTMLInputElement>(null);
  const webAppTitleRef = useRef<HTMLInputElement>(null);
  const dateFormatRef = useRef<HTMLInputElement>(null);

  const handleConnect = () => {
    window.open("https://pinpointy.com", "_blank", "noopener,noreferrer");
  };

  const handleSave = () => {
    const settings = {
      shopifyUrl: shopifyUrlRef.current?.value,
      shopifyToken: shopifyTokenRef.current?.value,
      webhooksKey: webhooksKeyRef.current?.value,
      logoUrl: logoUrlRef.current?.value,
      webAppTitle: webAppTitleRef.current?.value,
      dateFormat: dateFormatRef.current?.value,
      columns,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
            <input id="shopify-url" ref={shopifyUrlRef} defaultValue="halamama.myshopify.com" className={INPUT_CLS + " flex-1"} />
            <button
              onClick={handleConnect}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity shrink-0 w-full sm:w-auto"
            >
              <Link2 className="h-4 w-4" />
              Connect With Pinpointy
            </button>
          </div>
        </Field>

        <Field label="Shopify Access Token">
          <input id="shopify-token" ref={shopifyTokenRef} type="password" defaultValue="shpat_xxxxxxxxxxxxxxxxx" className={INPUT_CLS} />
        </Field>

        <Field label="Webhooks Secret Key">
          <input id="webhooks-key" ref={webhooksKeyRef} type="password" defaultValue="whsec_xxxxxxxxxxxxxxxxx" className={INPUT_CLS} />
        </Field>

        <Field label="Logo URL">
          <input id="logo-url" ref={logoUrlRef} defaultValue="https://halamama.com/cdn/shop/files/halamama_green.svg" className={INPUT_CLS} />
        </Field>

        <Field label="Web App Title">
          <input id="webapp-title" ref={webAppTitleRef} defaultValue="OMS Halamama" className={INPUT_CLS} />
        </Field>

        <Field label="Date Format" hint="Display format for dates across the application">
          <input id="date-format" ref={dateFormatRef} defaultValue="MMM DD | HH:mm" className={INPUT_CLS} />
        </Field>

        {saved && (
          <div className="flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-4 py-2.5 text-sm text-success font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved successfully.
          </div>
        )}

        <div className="pt-2">
          <button
            id="save-settings-btn"
            onClick={handleSave}
            className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity"
          >
            Save Settings
          </button>
        </div>
      </section>
    </div>
  );
}
