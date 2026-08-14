import { XCircle, CheckCircle2 } from "lucide-react";
import type { EnrichedOrder } from "@/lib/orders";

export function StockMatrix({ order }: { order: EnrichedOrder }) {
  const itemsList = order.itemsList || [];
  const skus = Array.from(new Set(itemsList.map(i => i.sku)));
  const getProductForSku = (sku: string) => itemsList.find(i => i.sku === sku);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Stock Availability Matrix</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground">
              <th className="px-5 py-4 w-1/4">Pharmacy Name</th>
              {skus.map(sku => {
                const product = getProductForSku(sku);
                const req = product?.qty || 0;
                return (
                  <th key={sku} className="px-5 py-4 text-center">
                    <div className="font-medium text-foreground truncate max-w-[200px] mx-auto" title={product?.name}>
                      {product?.name}
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground/80">
                      (SKU: {sku})
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      (Req: {req})
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {(order.matrix || []).map((row) => (
              <tr key={row.fc} className="hover:bg-muted/5 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-semibold text-foreground">{row.fc}</div>
                  <div className="text-xs text-muted-foreground">{row.fcName}</div>
                  {row.fc === "P63" && (
                    <div className="mt-1 inline-flex rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      External
                    </div>
                  )}
                </td>
                
                {skus.map(sku => {
                  const stockItem = row.items.find(i => i.sku === sku);
                  const available = stockItem?.available || 0;
                  
                  return (
                    <td key={sku} className="px-5 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-sm font-semibold">
                        {available > 0 ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-foreground">{available}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="text-foreground">{available}</span>
                          </>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
