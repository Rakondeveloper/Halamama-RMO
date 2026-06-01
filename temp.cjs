const fs = require('fs');
const content = fs.readFileSync('src/lib/orders.ts', 'utf8');
const counts = {};
const regex = /status:\s*['"]([^'"]+)['"]/g;
let match;
while ((match = regex.exec(content)) !== null) {
  counts[match[1]] = (counts[match[1]] || 0) + 1;
}
console.log(counts);
