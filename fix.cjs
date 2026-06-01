const fs = require('fs');
const file = 'src/components/orders/OrderList.tsx';
let code = fs.readFileSync(file, 'utf8');

// I will fix the filtered useMemo and all the variables below it up to onSelect.
const target = `    return result;
    });
  };`;

// Let's just find the `useMemo(() => { let result = orders.filter` block and replace it correctly.
code = code.replace(/const filtered = useMemo\([\s\S]*?return next;\r?\n    \}\);\r?\n  \};/,
`const filtered = useMemo(() => {
    let result = orders.filter(
      (o) => matchesLegacyTab(o, activeTab) && matchesSearch(o, search)
    );

    if (filters.status !== "All") {
      result = result.filter((o) => o.status === filters.status);
    }
    if (filters.customer.trim()) {
      const cSearch = filters.customer.toLowerCase();
      result = result.filter((o) => o.customer.name.toLowerCase().includes(cSearch));
    }
    
    const d = parseInt(days) || 1;
    if (d < 30 && result.length > 2) {
       result = result.slice(0, Math.max(1, result.length - Math.floor((30 - d) / 2)));
    }
    
    return result;
  }, [activeTab, search, filters, days, orders]);

  const tabCounts = useMemo(() => {
    const counts = {};
    for (const tab of LEGACY_TABS) {
      counts[tab.id] = countForLegacyTab(orders, tab.id);
    }
    return counts;
  }, [orders]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((o) => selectedIds.has(o.id));
  const someVisibleSelected =
    filtered.some((o) => selectedIds.has(o.id)) && !allVisibleSelected;

  const onSelect = (id, selected) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };`);

// Also fix typescript types if they were lost:
code = code.replace(`counts = {};`, `counts = {} as Record<LegacyTabId, number>;`);
code = code.replace(`onSelect = (id, selected) => {`, `onSelect = (id: string, selected: boolean) => {`);

fs.writeFileSync(file, code);
console.log('done');
