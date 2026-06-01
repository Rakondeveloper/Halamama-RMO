const fs = require('fs');
const file = 'src/components/orders/OrderList.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/import \{ OrderCard \} from "\.\/OrderCard";\r?\nimport \{ OrderCard \} from "\.\/OrderCard";/, 'import { OrderCard } from "./OrderCard";');

fs.writeFileSync(file, code);
console.log('done');
