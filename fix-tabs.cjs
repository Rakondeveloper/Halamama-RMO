const fs = require('fs');
const file = 'src/components/orders/OrderList.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetRegex = /const filtered = useMemo\(\(\) => \{[\s\S]*?return counts;\r?\n  \}, \[orders\]\);/;

const replacement = `const baseOrders = useMemo(() => {
    let result = [...orders];

    if (search.trim()) {
      result = result.filter((o) => matchesSearch(o, search));
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
  }, [orders, search, filters.customer, days]);

  const filtered = useMemo(() => {
    let result = baseOrders.filter((o) => matchesLegacyTab(o, activeTab));

    if (filters.status !== "All") {
      result = result.filter((o) => o.status === filters.status);
    }
    
    return result;
  }, [baseOrders, activeTab, filters.status]);

  const tabCounts = useMemo(() => {
    const counts = {} as Record<LegacyTabId, number>;
    for (const tab of LEGACY_TABS) {
      counts[tab.id] = countForLegacyTab(baseOrders, tab.id);
    }
    return counts;
  }, [baseOrders]);`;

code = code.replace(targetRegex, replacement);

fs.writeFileSync(file, code);
console.log('done');
