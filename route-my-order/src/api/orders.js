/* 
  Mock API for Order Data
  In production, these would be fetch/axios calls to the Laravel Backend
*/

let mockOrders = [
  // High-Fidelity Dummy Picking & Packing Orders
  {
    id: 'HM64110',
    customer: 'Dana Al-Thani',
    address: 'West Bay, Doha',
    phone: '55223344',
    total: 630,
    status: 'new',
    items: [
      { sku: 'NS-SPNC-1P-0200', name: 'Frida Baby Saline Spray', qty: 3, picked: false },
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 1, picked: false }
    ],
    bags: 0,
    assignedTo: null,
    date: '5/27/2026 • 10:15 AM'
  },
  {
    id: 'HM64112',
    customer: 'Zoe Henderson',
    address: 'The Pearl, Porto Arabia',
    phone: '33445566',
    total: 740,
    status: 'picking',
    items: [
      { sku: '5021933', name: 'SmarTrike STR3 6-in-1', qty: 1, picked: true },
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 2, picked: true },
      { sku: 'NS-SPNC-1P-0200', name: 'Frida Baby Saline Spray', qty: 1, picked: false }
    ],
    bags: 0,
    assignedTo: 'picker@rmo.qa',
    date: '5/27/2026 • 09:45 AM'
  },
  {
    id: 'HM64114',
    customer: 'Fatima Al-Kuwari',
    address: 'Al Waab, Villa 14',
    phone: '77665544',
    total: 490,
    status: 'picking',
    items: [
      { sku: 'HM-5542', name: 'Stroller Ultra Light', qty: 1, picked: true },
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 2, picked: false }
    ],
    bags: 0,
    assignedTo: 'nijad@rmo.qa',
    date: '5/26/2026 • 08:30 AM'
  },
  {
    id: 'HM64116',
    customer: 'Liam Gallagher',
    address: 'Lusail, Marina Drive',
    phone: '55009988',
    total: 320,
    status: 'packed',
    items: [
      { sku: 'NS-SPNC-1P-0200', name: 'Frida Baby Saline Spray', qty: 3, picked: true }
    ],
    bags: 0,
    assignedTo: null,
    date: '5/27/2026 • 09:12 AM'
  },
  {
    id: 'HM64118',
    customer: 'Amira Haddad',
    address: 'Doha Jadeed, St 45',
    phone: '66778899',
    total: 1250,
    status: 'packing',
    items: [
      { sku: '5021933', name: 'SmarTrike STR3 6-in-1', qty: 1, picked: true },
      { sku: 'NS-SPNC-1P-0200', name: 'Frida Baby Saline Spray', qty: 3, picked: true },
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 1, picked: true }
    ],
    bags: 1,
    assignedTo: 'packer@rmo.qa',
    date: '5/27/2026 • 08:40 AM'
  },
  {
    id: 'HM64120',
    customer: 'Yousef Al-Malki',
    address: 'Al Rayyan, Zone 53',
    phone: '33221199',
    total: 190,
    status: 'packing',
    items: [
      { sku: 'NS-SPNC-1P-0200', name: 'Frida Baby Saline Spray', qty: 1, picked: true }
    ],
    bags: 0,
    assignedTo: 'nijad@rmo.qa',
    date: '5/26/2026 • 02:15 PM'
  },

  // 1. New Orders from screenshots
  {
    id: 'HM63875',
    customer: 'Dilara Alkhoder',
    address: 'Lusail, Fox Hills, Bldg 12',
    phone: '55665085',
    total: 210,
    status: 'new', // new -> picking -> packed -> assigning -> assigned -> delivered / failed
    items: [
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 3, picked: false }
    ],
    bags: 0,
    assignedTo: null,
    date: '5/20/2026 • 06:40 AM'
  },
  {
    id: 'HM63874',
    customer: 'Venus Ellaine',
    address: 'West Bay, Tornado Tower',
    phone: '33942072',
    total: 450,
    status: 'new',
    items: [
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 8, picked: false }
    ],
    bags: 0,
    assignedTo: null,
    date: '5/20/2026 • 06:37 AM'
  },
  {
    id: 'HM63873',
    customer: 'Joan clemente',
    address: 'The Pearl, Porto Arabia',
    phone: '+97477158990',
    total: 90,
    status: 'new',
    items: [
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 1, picked: false }
    ],
    bags: 0,
    assignedTo: null,
    date: '5/20/2026 • 06:35 AM'
  },

  // 2. Completed Orders by other pickers (e.g. nijad)
  {
    id: 'HM63871',
    customer: 'Hilal ALABUHADDOUD',
    address: 'Al Waab, Villa 5',
    phone: '33343740',
    total: 180,
    status: 'packed',
    items: [
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 2, picked: true }
    ],
    bags: 1,
    assignedTo: null,
    pickedBy: 'nijad@rmo.qa',
    pickerName: 'nijad',
    date: '5/20/2026 • 06:12 AM'
  },
  {
    id: 'HM63870',
    customer: 'Cindy Chua',
    address: 'Doha Jadeed, A-Ring Rd',
    phone: '+97433752601',
    total: 180,
    status: 'packed',
    items: [
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 2, picked: true }
    ],
    bags: 1,
    assignedTo: null,
    pickedBy: 'nijad@rmo.qa',
    pickerName: 'nijad',
    date: '5/20/2026 • 06:11 AM'
  },
  {
    id: 'HM63869',
    customer: 'Monica Quezada',
    address: 'Abu Hamour, St 980',
    phone: '30152718',
    total: 180,
    status: 'packed',
    items: [
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 2, picked: true }
    ],
    bags: 1,
    assignedTo: null,
    pickedBy: 'nijad@rmo.qa',
    pickerName: 'nijad',
    date: '5/20/2026 • 06:02 AM'
  },
  {
    id: 'HM63868',
    customer: 'Yasmin Abedin',
    address: 'Al Sadd, Plaza Bldg',
    phone: '33127047',
    total: 360,
    status: 'packed',
    items: [
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 4, picked: true }
    ],
    bags: 2,
    assignedTo: null,
    pickedBy: 'nijad@rmo.qa',
    pickerName: 'nijad',
    date: '5/20/2026 • 05:35 AM'
  },
  {
    id: 'HM63867',
    customer: 'Manwa Alshamari',
    address: 'Gharaffa, St 12',
    phone: '60097002',
    total: 180,
    status: 'packed',
    items: [
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 2, picked: true }
    ],
    bags: 1,
    assignedTo: null,
    pickedBy: 'nijad@rmo.qa',
    pickerName: 'nijad',
    date: '5/20/2026 • 05:17 AM'
  },

  // 3. Completed Orders by picker Ahmed Khalil (picker@rmo.qa)
  {
    id: 'HM60570',
    customer: 'Noora Alboinin',
    address: 'Al Rayyan, Zone 53',
    phone: '33086608',
    total: 320,
    status: 'packed',
    items: [
      { sku: 'HM-5542', name: 'Stroller Ultra Light', qty: 1, picked: true },
      { sku: 'HM-1100', name: 'Wet Wipes 3-Pack', qty: 2, picked: true }
    ],
    bags: 2,
    assignedTo: null,
    pickedBy: 'picker@rmo.qa',
    pickerName: 'Ahmed Khalil',
    date: '4/28/2026 • 07:21 AM'
  }
]

// To match screenshots, we dynamically generate remaining orders
// We currently have 3 new orders, we need 18 more to make 21 new orders
const names = ['Layla Hassan', 'Mohammed Ali', 'Fatima Al-Jaber', 'Khalid Jassem', 'Mariam Al-Baker', 'Amina Yusuf', 'Sarah Jenkins']
const addresses = ['Lusail, Fox Hills, Bldg 12', 'West Bay, Doha', 'The Pearl, Porto Arabia', 'Madinat Khalifa', 'Wakra Coastal']

for (let i = 1; i <= 18; i++) {
  mockOrders.push({
    id: `HM6380${i}`,
    customer: names[i % names.length],
    address: addresses[i % addresses.length],
    phone: `550099${i.toString().padStart(2, '0')}`,
    total: 100 + i * 20,
    status: 'new',
    items: [
      { sku: `HM-GEN${i}`, name: 'Baby Care Product', qty: 1, picked: false }
    ],
    bags: 0,
    assignedTo: null,
    date: `5/20/2026 • 05:${(50 - i).toString().padStart(2, '0')} AM`
  })
}

// We currently have 0 active orders assigned to the picker. We need 5.
for (let i = 1; i <= 5; i++) {
  mockOrders.push({
    id: `HM6379${i}`,
    customer: names[(i + 2) % names.length],
    address: addresses[(i + 1) % addresses.length],
    phone: `660099${i.toString().padStart(2, '0')}`,
    total: 150 + i * 30,
    status: 'picking',
    items: [
      { sku: `HM-ACT${i}`, name: 'Wet Wipes 3-Pack', qty: 2, picked: i % 2 === 0 }
    ],
    bags: 0,
    assignedTo: 'picker@rmo.qa',
    date: `5/20/2026 • 07:${(10 + i).toString().padStart(2, '0')} AM`
  })
}

// We currently have 1 completed order for picker. We need 14 more to make 15 completed orders.
for (let i = 1; i <= 14; i++) {
  mockOrders.push({
    id: `HM6050${i}`,
    customer: names[(i + 4) % names.length],
    address: addresses[(i + 3) % addresses.length],
    phone: `770099${i.toString().padStart(2, '0')}`,
    total: 200 + i * 15,
    status: 'packed',
    items: [
      { sku: `HM-CMP${i}`, name: 'Baby Food Blend', qty: i % 2 === 0 ? 2 : 1, picked: true }
    ],
    bags: 1,
    assignedTo: null,
    pickedBy: 'picker@rmo.qa',
    pickerName: 'Ahmed Khalil',
    date: `5/19/2026 • 11:${(15 + i).toString().padStart(2, '0')} AM`
  })
}

// Add some active driver orders
for (let i = 1; i <= 4; i++) {
  mockOrders.push({
    id: `HM6381${i}`,
    customer: names[(i + 1) % names.length],
    address: addresses[(i + 2) % addresses.length],
    phone: `550088${i.toString().padStart(2, '0')}`,
    total: 200 + i * 20,
    status: 'assigned',
    items: [
      { sku: `HM-DRV${i}`, name: 'Baby Care Product', qty: 1, picked: true }
    ],
    bags: i % 3 === 0 ? 2 : 1,
    assignedTo: 'driver@rmo.qa',
    date: `5/20/2026 • 12:${(10 + i).toString().padStart(2, '0')} PM`
  })
}

// Add some completed driver orders
for (let i = 1; i <= 3; i++) {
  mockOrders.push({
    id: `HM6382${i}`,
    customer: names[(i + 3) % names.length],
    address: addresses[(i + 4) % addresses.length],
    phone: `550077${i.toString().padStart(2, '0')}`,
    total: 100 + i * 20,
    status: 'delivered',
    items: [
      { sku: `HM-DRV${i}`, name: 'Baby Care Product', qty: 1, picked: true }
    ],
    bags: 1,
    assignedTo: 'driver@rmo.qa',
    date: `5/20/2026 • 11:${(10 + i).toString().padStart(2, '0')} AM`
  })
}

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const fetchOrders = async (role, email) => {
  await delay(500)
  if (role === 'picker') {
    // Return all orders so that Completed and All tabs have full system view
    return mockOrders
  }
  if (role === 'packer') {
    // Return all orders that have completed picking or beyond, so all 4 tabs can filter
    return mockOrders.filter(o => ['packed', 'packing', 'assigning', 'assigned', 'delivered', 'failed'].includes(o.status))
  }
  if (role === 'driver') {
    return mockOrders.filter(o => o.assignedTo === email && ['packed', 'assigned'].includes(o.status))
  }
  return []
}

export const assignOrder = async (orderId, email, role) => {
  await delay(300)
  const o = mockOrders.find(o => o.id === orderId)
  if (o) {
    o.assignedTo = email
    if (role === 'picker') {
      o.status = 'picking'
    }
    if (role === 'packer') {
      o.status = 'packing'
    }
  }
  return o
}

export const updateItemPickStatus = async (orderId, sku, picked) => {
  await delay(200)
  const o = mockOrders.find(o => o.id === orderId)
  if (o) {
    const item = o.items.find(i => i.sku === sku)
    if (item) item.picked = picked
  }
  return o
}

export const completePicking = async (orderId, pickerEmail, pickerName) => {
  await delay(400)
  const o = mockOrders.find(o => o.id === orderId)
  if (o) {
    o.status = 'packed' // Ready for packer
    o.assignedTo = null // Release for packers
    o.pickedBy = pickerEmail || 'picker@rmo.qa'
    o.pickerName = pickerName || 'Ahmed Khalil'
  }
  return o
}

export const completePacking = async (orderId, bags, packerEmail, packerName) => {
  await delay(400)
  const o = mockOrders.find(o => o.id === orderId)
  if (o) {
    o.bags = bags
    o.status = 'assigning' // Ready for admin to assign to driver
    o.assignedTo = null
    o.packedBy = packerEmail || 'packer@rmo.qa'
    o.packerName = packerName || 'Packer'
  }
  return o
}

export const flagOrderIssue = async (orderId, note) => {
  await delay(300)
  console.log(`[API] Order ${orderId} flagged: ${note}`)
  return true
}

export const markDelivered = async (orderId, paymentMethod) => {
  await delay(600)
  const o = mockOrders.find(o => o.id === orderId)
  if (o) o.status = 'delivered'
  return true
}

export const markFailed = async (orderId, reason) => {
  await delay(600)
  const o = mockOrders.find(o => o.id === orderId)
  if (o) o.status = 'failed'
  return true
}

