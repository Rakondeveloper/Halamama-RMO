import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchOrders, startDelivery, markDelivered, markFailed, markReturnCollected, subscribeToSync, verifyOrderBags } from '../../api/orders'
import {
  MapPin,
  Navigation,
  Package,
  XCircle,
  CreditCard,
  Banknote,
  Link,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  CheckSquare,
  Check,
  X,
  RefreshCcw,
  Calendar,
  AlertCircle,
  Info,
  User,
  Phone,
  RotateCcw,
  Search
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import './driver.css'

const formatAssignedTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const cleanStr = dateStr.replace('•', '').replace(/\s+/g, ' ');
    const parts = cleanStr.split(' ');
    if (parts.length >= 2) {
      const datePart = parts[0];
      const timePart = parts.slice(1).join(' ');
      const dParts = datePart.split('/');
      if (dParts.length === 3) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = parseInt(dParts[0], 10) - 1;
        const day = dParts[1].padStart(2, '0');
        const year = dParts[2];
        const monthName = monthNames[monthIndex] || dParts[0];
        return `${day}-${monthName}-${year} | ${timePart}`;
      }
    }
  } catch (e) {
    console.warn(e);
  }
  return dateStr.replace('•', '|');
};

const formatPhone = (phoneStr) => {
  if (!phoneStr) return '—';
  if (phoneStr.startsWith('+')) return phoneStr;
  return `+974 ${phoneStr}`;
};

const DeliveryCountdown = ({ dateStr, orderStatus }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [statusClass, setStatusClass] = useState('')

  useEffect(() => {
    if (orderStatus === 'delivered' || orderStatus === 'failed') {
      setTimeLeft('')
      return
    }

    const calculateTime = () => {
      if (!dateStr) return
      const cleanStr = dateStr.replace('•', '').replace(/\s+/g, ' ')
      const handoverTime = new Date(cleanStr)
      if (isNaN(handoverTime.getTime())) {
        setTimeLeft('')
        return
      }

      const limitMs = 4 * 60 * 60 * 1000 // 4 hours
      const deadline = handoverTime.getTime() + limitMs
      const now = new Date().getTime()
      const diff = deadline - now

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft(`${hours}h ${minutes}m left`)
        
        if (diff > 2 * 60 * 60 * 1000) {
          setStatusClass('countdown-green')
        } else {
          setStatusClass('countdown-orange')
        }
      } else {
        const absDiff = Math.abs(diff)
        const hours = Math.floor(absDiff / (1000 * 60 * 60))
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft(`Overdue by ${hours}h ${minutes}m`)
        setStatusClass('countdown-red')
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 10000)
    return () => clearInterval(timer)
  }, [dateStr, orderStatus])

  if (!timeLeft) return null

  return (
    <span className={`delivery-countdown ${statusClass}`}>
      <Clock size={11} style={{ marginRight: '4px' }} />
      {timeLeft}
    </span>
  )
}

export function DriverDashboard() {
  const { user } = useAuth()
  const { success, error } = useToast()
  
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeOrder, setActiveOrder] = useState(null)
  const [allOrdersModalOpen, setAllOrdersModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortZone, setSortZone] = useState('')
  
  // Execution Steps State
  const [step, setStep] = useState(1) // 1: Verify, 2: Navigate, 3: Deliver
  
  // Modals
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [verifyingOrder, setVerifyingOrder] = useState(null)
  const [verificationError, setVerificationError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [collectedAmount, setCollectedAmount] = useState('')
  const [failureModalOpen, setFailureModalOpen] = useState(false)
  const [failureReason, setFailureReason] = useState('')
  const [returnCollectModalOpen, setReturnCollectModalOpen] = useState(false)
  const [returnCollectItem, setReturnCollectItem] = useState(null)
  const [returnDriverNote, setReturnDriverNote] = useState('')
  const [returnCollecting, setReturnCollecting] = useState(false)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await fetchOrders('driver', user.email)
      setOrders(data)
    } catch (err) {
      error('Failed to load active route')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    const unsubscribe = subscribeToSync(() => {
      loadOrders()
    })
    return () => unsubscribe()
  }, [])

  const handleStartRun = (order) => {
    setActiveOrder(order)
    if (order.status === 'delivered' || order.status === 'failed') {
      setStep(4) // 4 = Read-only completed state
    } else if (order.status === 'started') {
      setStep(3)
    } else if (order.bagVerificationStatus === 'verified') {
      setStep(2)
    } else {
      setStep(1)
    }
  }

  const handleVerifyBags = async () => {
    if (!verifyingOrder) return
    
    setVerifying(true)
    setVerificationError('')
    try {
      await verifyOrderBags(verifyingOrder.id)
      setVerifyModalOpen(false)
      setVerifyingOrder(null)
      success('Bags verified successfully.')
      
      if (activeOrder) {
        // Flow from within Order Summary page
        setActiveOrder(prev => prev ? { ...prev, bagVerificationStatus: 'verified' } : null)
        setStep(2)
      }
      loadOrders()
    } catch (err) {
      setVerificationError('Failed to verify bags.')
    } finally {
      setVerifying(false)
    }
  }

  const handleStartDelivery = async () => {
    try {
      await startDelivery(activeOrder.id)
      setStep(3)
      success('Delivery started. Customer notified.')
      loadOrders()
    } catch (err) {
      error('Failed to start delivery')
    }
  }

  const handleSuccess = async () => {
    try {
      await markDelivered(activeOrder.id, paymentMethod)
      success('Delivery marked as successful!')
      setPaymentModalOpen(false)
      setActiveOrder(null)
      loadOrders()
    } catch (err) {
      error('Failed to mark delivered')
    }
  }

  const handleFail = async () => {
    if (!failureReason) return
    try {
      await markFailed(activeOrder.id, failureReason)
      success('Delivery marked as failed.')
      setFailureModalOpen(false)
      setActiveOrder(null)
      loadOrders()
    } catch (err) {
      error('Failed to mark failure')
    }
  }

  const handleOpenMaps = () => {
    if (!activeOrder) return
    const lat = activeOrder.lat ?? activeOrder.latitude
    const lng = activeOrder.lng ?? activeOrder.longitude
    
    const destination = (lat !== undefined && lat !== null && lng !== undefined && lng !== null)
      ? `${lat},${lng}`
      : activeOrder.address
      
    if (!destination) {
      error('Location data is unavailable for this order.')
      return
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    window.open(url, '_blank')
  }

  const handleCall = () => {
    if (!activeOrder || !activeOrder.phone) {
      error('Phone number is unavailable for this customer.')
      return
    }
    const sanitizedPhone = activeOrder.phone.replace(/[^\d+]/g, '')
    if (!sanitizedPhone) {
      error('Invalid phone number format.')
      return
    }
    window.location.href = `tel:${sanitizedPhone}`
  }

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'failed')
  const completedOrdersList = orders.filter(o => o.status === 'delivered' || o.status === 'failed')

  const getTabCount = (tabName) => {
    let list = []
    switch (tabName) {
      case 'Accepted':
        list = orders.filter(o => o.status === 'assigned' || o.status === 'packed')
        break
      case 'Started':
        list = orders.filter(o => o.status === 'started')
        break
      case 'Delivered':
        list = orders.filter(o => o.status === 'delivered')
        break
      case 'Completed':
        list = orders.filter(o => o.status === 'delivered' || o.status === 'failed')
        break
      case 'All':
      default:
        list = orders
        break
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(o => {
        const orderId = (o.id || '').toLowerCase()
        const customer = (o.customer || '').toLowerCase()
        const phone = (o.phone || '').toLowerCase()
        const address = (o.address || '').toLowerCase()
        const zone = (o.zone || '').toLowerCase()
        return orderId.includes(q) || customer.includes(q) || phone.includes(q) || address.includes(q) || zone.includes(q)
      })
    }
    return list.length
  }

  const filteredOrdersList = (() => {
    let list = []
    switch (activeTab) {
      case 'Accepted':
        list = orders.filter(o => o.status === 'assigned' || o.status === 'packed')
        break
      case 'Started':
        list = orders.filter(o => o.status === 'started')
        break
      case 'Delivered':
        list = orders.filter(o => o.status === 'delivered')
        break
      case 'Completed':
        list = orders.filter(o => o.status === 'delivered' || o.status === 'failed')
        break
      case 'All':
      default:
        list = orders
        break
    }

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(o => {
        const orderId = (o.id || '').toLowerCase()
        const customer = (o.customer || '').toLowerCase()
        const phone = (o.phone || '').toLowerCase()
        const address = (o.address || '').toLowerCase()
        const zone = (o.zone || '').toLowerCase()
        return orderId.includes(q) || customer.includes(q) || phone.includes(q) || address.includes(q) || zone.includes(q)
      })
    }

    // 2. Sort by Zone
    if (sortZone === 'asc') {
      list = [...list].sort((a, b) => {
        const zoneA = (a.zone || '').toLowerCase()
        const zoneB = (b.zone || '').toLowerCase()
        return zoneA.localeCompare(zoneB)
      })
    } else if (sortZone === 'desc') {
      list = [...list].sort((a, b) => {
        const zoneA = (a.zone || '').toLowerCase()
        const zoneB = (b.zone || '').toLowerCase()
        return zoneB.localeCompare(zoneA)
      })
    }

    return list
  })()

  // Detail view (delivery execution)
  if (activeOrder) {
    return (
      <div className="driver-detail-view">
        {/* Fixed Header */}
        <div className="driver-header" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <button onClick={() => setActiveOrder(null)} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={18} />
            </button>
            <h2 className="driver-header-title" style={{ margin: 0, textTransform: 'none' }}>Order Summary</h2>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="driver-avatar">{user.name.charAt(0)}</div>
              <div className="driver-user-info">
                <div className="driver-user-name">{user.name}</div>
                <div className="driver-user-role">Driver</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="driver-detail-body">
          
          {/* Status Card */}
          <div className="driver-summary-status-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="driver-order-id" style={{ fontSize: '18px', fontWeight: '800' }}>{activeOrder.id}</span>
                {activeOrder.bagVerificationStatus === 'verified' && (
                  <span className="driver-status-pill verified">
                    ✓ VERIFIED
                  </span>
                )}
                <span className={`driver-status-pill ${activeOrder.status === 'assigned' ? 'accepted' : (activeOrder.status === 'started' ? 'started' : activeOrder.status)}`}>
                  {activeOrder.status === 'assigned' ? 'accepted' : (activeOrder.status === 'started' ? 'started' : activeOrder.status)}
                </span>
                {activeOrder.returnItems && activeOrder.returnItems.length > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    background: '#fef7cd', color: '#b45309', border: '1px solid #fde68a',
                    padding: '2px 8px', fontSize: '10px', fontWeight: '700',
                    borderRadius: '10px'
                  }}>
                    Collect ({activeOrder.returnItems.filter(r => r.status === 'pending').length})
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {(step > 1 || activeOrder.bagVerificationStatus === 'verified') && step !== 4 && (
                  <span className="driver-status-pill verified"><CheckCircle2 size={12}/> Verified</span>
                )}
              </div>
            </div>
            <div className="driver-summary-date" style={{ marginBottom: step === 1 ? '16px' : '0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>{activeOrder.date}</span>
              <DeliveryCountdown dateStr={activeOrder.date} orderStatus={activeOrder.status} />
            </div>
            
            {step === 1 && (
              <button 
                className="driver-btn-complete primary" 
                style={{ 
                  marginTop: '12px', 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  fontWeight: '800',
                  fontSize: '14px',
                  padding: '12px'
                }} 
                onClick={() => {
                  setVerifyingOrder(activeOrder)
                  setVerifyModalOpen(true)
                  setVerificationError('')
                }}
              >
                <Package size={16} /> Verify Bags
              </button>
            )}
          </div>

          {/* Order Items */}
          <div className="driver-summary-card">
            <div className="driver-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '12px' }}>
                <Package size={14}/> Order Items
              </div>
              <div className="driver-badge">{activeOrder.bags} Bags | {activeOrder.items?.reduce((a, b) => a + b.qty, 0) || 0} Items</div>
            </div>
            <div className="driver-items-list">
              {activeOrder.items?.map((item, idx) => (
                <div key={idx} className="driver-item-row">
                  <div className="driver-item-image">
                    <Package size={18} color="var(--color-muted)"/>
                  </div>
                  <div className="driver-item-details">
                    <div className="driver-item-name">{item.name}</div>
                    <div className="driver-item-meta">
                      <span className="driver-item-qty">Qty: {item.qty}</span>
                      <span>•</span>
                      <span className="driver-item-sku">SKU: {item.sku}</span>
                    </div>
                    {item.fcName && (
                      <div style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: '700', marginTop: '3px' }}>
                        Loc: {item.fcName}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Returns / Collections Section */}
          {activeOrder.returnItems && activeOrder.returnItems.length > 0 && (
            <div className="driver-summary-card">
              <div className="driver-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '12px' }}>
                  <RotateCcw size={14}/> Returns / Collections
                </div>
                <div className="driver-badge">{activeOrder.returnItems.length}</div>
              </div>
              
              {/* Return items table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '6px', padding: '8px 12px', borderBottom: '1.5px solid var(--color-border)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                <span>Item</span>
                <span>Type</span>
                <span style={{ textAlign: 'center' }}>Qty</span>
                <span style={{ textAlign: 'right' }}>Status</span>
              </div>
              
              {/* Return items */}
              {activeOrder.returnItems.map((ret, idx) => (
                <div key={ret.id || idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '6px', padding: '10px 12px', borderBottom: idx < activeOrder.returnItems.length - 1 ? '1px solid var(--color-light-gray)' : 'none', alignItems: 'center', fontSize: '11px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '11px', lineHeight: '1.3' }}>{ret.itemName}</div>
                    {ret.sku && <div style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>{ret.sku}</div>}
                  </div>
                  <span style={{ padding: '1px 6px', background: 'var(--color-light-gray)', fontWeight: '600', fontSize: '9px', textTransform: 'uppercase' }}>{ret.type}</span>
                  <span style={{ textAlign: 'center', fontWeight: '700' }}>{ret.qty}</span>
                  <div style={{ textAlign: 'right' }}>
                    {ret.status === 'pending' ? (
                      <button
                        onClick={() => {
                          setReturnCollectItem(ret)
                          setReturnDriverNote('')
                          setReturnCollectModalOpen(true)
                        }}
                        style={{
                          background: 'black', color: 'white', border: 'none',
                          padding: '4px 10px', fontSize: '10px', fontWeight: '700',
                          cursor: 'pointer', textTransform: 'uppercase'
                        }}
                      >
                        Collect
                      </button>
                    ) : ret.status === 'picked up' ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                        background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                        padding: '2px 8px', fontSize: '9px', fontWeight: '700',
                        borderRadius: '10px'
                      }}>
                        <CheckCircle2 size={10} /> Collected
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                        background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                        padding: '2px 8px', fontSize: '9px', fontWeight: '700',
                        borderRadius: '10px'
                      }}>
                        <Check size={10} /> Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {/* All collected banner */}
              {activeOrder.returnItems.every(r => r.status !== 'pending') && (
                <div style={{
                  padding: '10px 12px', background: '#f0fdf4', borderTop: '1px solid #bbf7d0',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '11px', fontWeight: '600', color: '#16a34a'
                }}>
                  <CheckCircle2 size={14} /> All items collected. Return verified.
                </div>
              )}
            </div>
          )}

          {/* Pickup Locations Summary */}
          <div className="driver-summary-card">
            <div className="driver-card-title">Pickup Locations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Array.from(new Set(activeOrder.items?.map(i => i.fcName || 'Main Warehouse'))).map((locName, idx) => {
                const matchingItem = activeOrder.items?.find(i => i.fcName === locName);
                const isVL = matchingItem?.itemType === 'VL_HMA';
                
                let details = null;
                if (isVL && matchingItem.locationId) {
                  try {
                    const raw = localStorage.getItem('hm_vendor_locations');
                    if (raw) {
                      const locs = JSON.parse(raw);
                      const loc = locs.find(l => l.locationId === matchingItem.locationId || (matchingItem.locationId === 'loc-1' && l.locationId === 'loc-001'));
                      if (loc) {
                        details = (
                          <div style={{ color: 'var(--color-muted)', fontSize: '11px', marginTop: '2px', lineHeight: '1.4' }}>
                            <div><strong>Address:</strong> {loc.address}</div>
                            <div><strong>Contact:</strong> {loc.contactPerson} ({loc.phone})</div>
                          </div>
                        );
                      }
                    }
                  } catch (e) {}
                }
                
                return (
                  <div key={idx} style={{ fontSize: '12px', borderBottom: idx < Array.from(new Set(activeOrder.items?.map(i => i.fcName))).length - 1 ? '1px solid var(--color-light-gray)' : 'none', paddingBottom: '6px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--color-fg)' }}>{locName}</div>
                    {details}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer */}
          <div className="driver-summary-card">
             <div className="driver-card-title">Customer</div>
             <div className="driver-customer-name" style={{ marginBottom: '10px', fontSize: '13px', fontWeight: '700', color: 'var(--color-fg)' }}>{activeOrder.customer}</div>
             
             <div className="driver-info-label">Contact information</div>
             <div className="driver-info-value" style={{ marginBottom: '10px', color: 'var(--color-fg)', fontSize: '12px' }}>{activeOrder.phone}</div>
             
             <div className="driver-info-label">Shipping address</div>
             <div className="driver-info-value" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--color-fg)', marginBottom: '10px' }}>
                <div style={{ flex: 1, lineHeight: '1.3', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px' }}><User size={12} color="var(--color-muted)"/></div>
                    <strong>{activeOrder.customer}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px', marginTop: '2px' }}><MapPin size={12} color="var(--color-muted)"/></div>
                    <div>
                      {activeOrder.address}
                      {(activeOrder.lat !== undefined && activeOrder.lat !== null && activeOrder.lng !== undefined && activeOrder.lng !== null) ? (
                        <div style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>
                          Lat: {activeOrder.lat} Lng: {activeOrder.lng}
                        </div>
                      ) : (activeOrder.latitude && activeOrder.longitude) ? (
                        <div style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>
                          Lat: {activeOrder.latitude} Lng: {activeOrder.longitude}
                        </div>
                      ) : (
                        <div style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>
                          No Coordinates Available
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px' }}><Phone size={12} color="var(--color-muted)"/></div>
                     <span>{activeOrder.phone}</span>
                  </div>
                </div>
             </div>

             <div style={{ display: 'flex', gap: '6px' }}>
               <button className="driver-btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px', textTransform: 'none', fontWeight: '600', fontSize: '11px' }} onClick={handleOpenMaps}>
                 <MapPin size={12} /> Open In Maps
               </button>
               <button className="driver-btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px', background: 'var(--color-light-gray)', textTransform: 'none', fontWeight: '600', fontSize: '11px' }} onClick={handleCall}>
                 <Phone size={12} /> Call
               </button>
             </div>
          </div>

          {/* Notes */}
          <div className="driver-summary-card">
            <div className="driver-card-title">Notes</div>
            <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
              {activeOrder.notes || 'Fast delivery'}
            </div>
          </div>

          {/* Billing Details */}
          <div className="driver-summary-card">
            <div style={{ marginBottom: '10px' }}>
               <span className="driver-status-pill verified" style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', padding: '1px 6px', fontSize: '9px' }}>
                 <Check size={10} /> Paid
               </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
               <span style={{ color: 'var(--color-fg)' }}>Subtotal <span style={{ color: 'var(--color-muted)', marginLeft: '6px' }}>{activeOrder.items?.reduce((a,b)=>a+b.qty, 0) || 0} items</span></span>
               <span style={{ fontWeight: '600' }}>QAR {activeOrder.total}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
               <span style={{ color: 'var(--color-fg)' }}>Discount</span>
               <span style={{ fontWeight: '600', color: 'var(--color-muted)' }}>-QAR 0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', borderBottom: '1.5px solid var(--color-light-gray)', paddingBottom: '8px' }}>
               <span style={{ color: 'var(--color-fg)' }}>Shipping <span style={{ color: 'var(--color-muted)', marginLeft: '6px' }}>Standard Delivery</span></span>
               <span style={{ fontWeight: '600' }}>QAR 0</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
               <span style={{ color: 'var(--color-fg)' }}>Total</span>
               <span style={{ fontWeight: '800' }}>QAR {activeOrder.total}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
               <span style={{ color: 'var(--color-fg)' }}>Paid</span>
               <span style={{ fontWeight: '600' }}>QAR {activeOrder.total}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
               <span style={{ fontWeight: '800', color: 'var(--color-fg)' }}>Balance</span>
               <span style={{ fontWeight: '800' }}>QAR 0.00</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
             {step === 2 && (
               <button className="driver-btn-complete primary" onClick={handleStartDelivery}>
                 <Navigation size={14} /> Start Delivery
               </button>
             )}
             {step === 3 && (
               <>
                 <button className="driver-btn-complete primary" onClick={() => {
                   setCollectedAmount(activeOrder.total.toString())
                   setPaymentModalOpen(true)
                 }}>
                   <CheckCircle2 size={14} /> Mark as Delivered
                 </button>
                 <button className="driver-btn-exception" onClick={() => setFailureModalOpen(true)}>
                   <XCircle size={14} /> Delivery Not Completed
                 </button>
               </>
             )}
             {step === 4 && (
               <button className="driver-btn-complete outline" onClick={() => setActiveOrder(null)}>
                 Back to Dashboard
               </button>
             )}
          </div>
        </div>

        {/* Verification Modal */}
        {verifyModalOpen && verifyingOrder && (
          <div className="driver-modal-overlay">
            <div className="driver-modal-content" style={{ maxWidth: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="driver-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, textTransform: 'none' }}>
                  <Package size={18}/> Bag Verification
                </h3>
                <button 
                  onClick={() => {
                    setVerifyModalOpen(false)
                    setVerifyingOrder(null)
                    setVerificationError('')
                  }} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg)' }}
                >
                  <X size={18}/>
                </button>
              </div>
              <p className="driver-modal-desc" style={{ textAlign: 'left', marginBottom: '20px' }}>Confirm that physical counts match the values below before starting delivery.</p>
              
              {verificationError && (
                <div className="driver-warning-box" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{verificationError}</span>
                </div>
              )}

              <div className="driver-verification-metrics">
                <div className="metric-box">
                  <div className="label">EXPECTED BAGS</div>
                  <div className="value">{verifyingOrder.bags}</div>
                </div>
                <div className="metric-box">
                  <div className="label">TOTAL ITEMS</div>
                  <div className="value">{verifyingOrder.items?.reduce((acc, i) => acc + i.qty, 0) || 0}</div>
                </div>
              </div>

              <div className="driver-info-box">
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Scan or count the physical bags provided to ensure they match the number displayed above.</span>
              </div>
              <div className="driver-warning-box">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Verifying ensures you are accountable only for the items you have physically received.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
                <button 
                  className="driver-btn-cancel" 
                  disabled={verifying}
                  onClick={() => {
                    setVerifyModalOpen(false)
                    setVerifyingOrder(null)
                    setVerificationError('')
                  }}
                >
                  Back
                </button>
                <button 
                  className="driver-btn-confirm" 
                  disabled={verifying}
                  onClick={handleVerifyBags}
                >
                  {verifying ? 'Verifying...' : 'Match & Verify'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {paymentModalOpen && (
          <div className="driver-modal-overlay">
            <div className="driver-modal-content">
              <h3 className="driver-modal-title">Collect Payment</h3>
              <p className="driver-modal-desc">Total due: <strong>QAR {activeOrder.total}</strong></p>
              
              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Amount Collected (QAR)</label>
                <input 
                  type="number" 
                  value={collectedAmount} 
                  onChange={(e) => setCollectedAmount(e.target.value)} 
                  className="driver-select" 
                  style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 0 }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', textAlign: 'left' }}>Payment Method</label>
                <button
                  className={`driver-payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={14} /> Card (POS)
                </button>
                <button
                  className={`driver-payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Banknote size={14} /> Cash
                </button>
                <button
                  className={`driver-payment-option ${paymentMethod === 'link' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('link')}
                >
                  <Link size={14} /> Payment Link Sent
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="driver-btn-confirm" onClick={handleSuccess}>
                  <Check size={14} />
                  <span>Confirm</span>
                </button>
                <button className="driver-btn-cancel" onClick={() => setPaymentModalOpen(false)}>
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Failure Modal */}
        {failureModalOpen && (
          <div className="driver-modal-overlay">
            <div className="driver-modal-content">
              <h3 className="driver-modal-title">Report Failure</h3>
              <p className="driver-modal-desc">Select the reason for failed delivery.</p>
              
              <select 
                className="driver-select"
                value={failureReason}
                onChange={e => setFailureReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                <option value="customer_unreachable">Customer not answering</option>
                <option value="wrong_address">Wrong Address / Location</option>
                <option value="customer_rejected">Customer Rejected Order</option>
                <option value="payment_failed">Payment Failed</option>
                <option value="rescheduled">Customer Rescheduled</option>
              </select>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="driver-btn-confirm" disabled={!failureReason} onClick={handleFail}>
                  <Check size={14} />
                  <span>Submit Report</span>
                </button>
                <button className="driver-btn-cancel" onClick={() => setFailureModalOpen(false)}>
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  }

  return (
    <div className="driver-container">
      <div className="driver-content">
        
        {/* Top Vertical Metrics */}
        <div className="driver-vertical-metrics">
          <div className="driver-vertical-metric-card">
            <div>
              <div className="metric-title">Completed Deliveries</div>
              <div className="metric-value">{completedOrdersList.length}</div>
              <div className="metric-subtitle">Updated just now</div>
            </div>
            <CheckCircle2 size={20} color="var(--color-muted)" />
          </div>
          <div className="driver-vertical-metric-card">
            <div>
              <div className="metric-title">Pending Deliveries</div>
              <div className="metric-value">{activeOrders.length}</div>
              <div className="metric-subtitle">Updated just now</div>
            </div>
            <Clock size={20} color="var(--color-muted)" />
          </div>
        </div>

        {/* Assigned Orders List */}
        <div className="driver-section-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '18px', fontWeight: '800' }}>
            Assigned Orders <RefreshCcw size={14} style={{ cursor: 'pointer', color: 'var(--color-muted)' }} onClick={loadOrders}/>
          </h3>
          <button 
            className="driver-btn-outline" 
            style={{ padding: '6px 12px', fontSize: '11px', borderRadius: 0 }}
            onClick={() => setAllOrdersModalOpen(true)}
          >
            VIEW ALL ORDERS
          </button>
        </div>

        {/* Tabs */}
        <div className="driver-tabs">
          {['Accepted', 'Started', 'Delivered', 'Completed', 'All'].map(tab => (
            <button
              key={tab}
              className={`driver-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="driver-tab-badge">
                {getTabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="driver-search-sort-container" style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '16px',
          width: '100%'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-muted)'
            }} />
            <input
              type="text"
              placeholder="Search by Order #, customer, phone, address, zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                border: '1.5px solid var(--color-border)',
                background: 'var(--color-bg)',
                color: 'var(--color-fg)',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            value={sortZone}
            onChange={(e) => setSortZone(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-bg)',
              color: 'var(--color-fg)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '130px'
            }}
          >
            <option value="">Sort by Zone</option>
            <option value="asc">Zone (A → Z)</option>
            <option value="desc">Zone (Z → A)</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>Loading...</div>
        ) : (
          <div className="driver-orders-list">
            {filteredOrdersList.length === 0 && (
               <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px', border: '1.5px solid var(--color-border)' }}>
                 No orders found in this status
               </div>
            )}
            {filteredOrdersList.map(order => (
              <div key={order.id} className="driver-order-card">
                <div className="driver-order-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="driver-order-id" style={{ fontSize: '14px', fontWeight: '800' }}>{order.id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {order.bagVerificationStatus === 'verified' && (
                      <span className="driver-status-pill verified">
                        ✓ VERIFIED
                      </span>
                    )}
                    <span className={`driver-status-pill ${order.status === 'assigned' ? 'accepted' : (order.status === 'started' ? 'started' : order.status)}`}>
                      {order.status === 'assigned' ? 'accepted' : (order.status === 'started' ? 'started' : order.status)}
                    </span>
                  </div>
                </div>
                <div className="driver-order-details" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-muted)', fontSize: '11px', marginBottom: '2px', flexWrap: 'wrap' }}>
                     <Calendar size={11}/> {formatAssignedTime(order.date)}
                     <DeliveryCountdown dateStr={order.date} orderStatus={order.status} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                    <div style={{ color: 'var(--color-fg)', fontWeight: '700', fontSize: '13px' }}>{order.customer}</div>
                    <div style={{ color: 'var(--color-muted)' }}>
                      <span style={{ color: 'var(--color-fg)', fontWeight: '600' }}>{formatPhone(order.phone)}</span>
                      {' • '}
                      <span style={{ color: 'var(--color-fg)', fontWeight: '600' }}>{order.zone || (order.address && order.address.toLowerCase().startsWith('zone') ? order.address : 'West Bay')}</span>
                    </div>
                    <div style={{ color: 'var(--color-fg)' }}>{order.address || '—'}</div>
                  </div>
                </div>
                <div className="driver-order-footer">
                  <span className="driver-order-total" style={{ fontSize: '14px', fontWeight: 'bold' }}>QAR {order.total}.00</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {order.returnItems && order.returnItems.length > 0 && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                        background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                        padding: '2px 8px', fontSize: '10px', fontWeight: '700',
                        borderRadius: '10px'
                      }}>
                        <RotateCcw size={10} /> Return ({order.returnItems.length})
                      </span>
                    )}
                    {(order.status === 'assigned' || order.status === 'packed') && (
                      order.bagVerificationStatus === 'verified' ? (
                        <span className="driver-status-pill verified" style={{ padding: '6px 12px' }}>
                          ✓ VERIFIED
                        </span>
                      ) : (
                        <button
                          className="driver-btn-complete primary"
                          style={{ padding: '6px 12px', fontSize: '11px', width: 'auto' }}
                          onClick={() => {
                            setVerifyingOrder(order)
                            setVerifyModalOpen(true)
                            setVerificationError('')
                          }}
                        >
                          <Package size={12} /> Verify
                        </button>
                      )
                    )}
                    <button className="driver-btn-view" onClick={() => handleStartRun(order)}>View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* All Orders Full Screen Page/Modal */}
      {allOrdersModalOpen && !activeOrder && (
        <div className="driver-detail-view">
          <div className="driver-header" style={{ display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <button onClick={() => setAllOrdersModalOpen(false)} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={18} />
              </button>
              <h2 className="driver-header-title" style={{ margin: 0, textTransform: 'none' }}>All Orders</h2>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCcw size={16} style={{ cursor: 'pointer', color: 'var(--color-fg)' }} onClick={loadOrders}/>
              </div>
            </div>
          </div>
          
          <div className="driver-detail-body">
            <div className="driver-orders-list">
              {orders.length === 0 && (
                 <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px', border: '1.5px solid var(--color-border)' }}>
                   No orders found
                 </div>
              )}
              {orders.map(order => (
                <div key={order.id} className="driver-order-card">
                  <div className="driver-order-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="driver-order-id" style={{ fontSize: '14px', fontWeight: '800' }}>{order.id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {order.bagVerificationStatus === 'verified' && (
                        <span className="driver-status-pill verified">
                          ✓ VERIFIED
                        </span>
                      )}
                      <span className={`driver-status-pill ${order.status === 'assigned' ? 'accepted' : (order.status === 'started' ? 'started' : order.status)}`}>
                        {order.status === 'assigned' ? 'accepted' : (order.status === 'started' ? 'started' : order.status)}
                      </span>
                    </div>
                  </div>
                  <div className="driver-order-details" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-muted)', fontSize: '11px', marginBottom: '2px', flexWrap: 'wrap' }}>
                       <Calendar size={11}/> {formatAssignedTime(order.date)}
                       <DeliveryCountdown dateStr={order.date} orderStatus={order.status} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                      <div style={{ color: 'var(--color-fg)', fontWeight: '700', fontSize: '13px' }}>{order.customer}</div>
                      <div style={{ color: 'var(--color-muted)' }}>
                        <span style={{ color: 'var(--color-fg)', fontWeight: '600' }}>{formatPhone(order.phone)}</span>
                        {' • '}
                        <span style={{ color: 'var(--color-fg)', fontWeight: '600' }}>{order.zone || (order.address && order.address.toLowerCase().startsWith('zone') ? order.address : 'West Bay')}</span>
                      </div>
                      <div style={{ color: 'var(--color-fg)' }}>{order.address || '—'}</div>
                    </div>
                  </div>
                  <div className="driver-order-footer">
                    <span className="driver-order-total" style={{ fontSize: '14px', fontWeight: 'bold' }}>QAR {order.total}.00</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {order.returnItems && order.returnItems.length > 0 && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                          padding: '2px 8px', fontSize: '10px', fontWeight: '700',
                          borderRadius: '10px'
                        }}>
                          <RotateCcw size={10} /> Return ({order.returnItems.length})
                        </span>
                      )}
                      {(order.status === 'assigned' || order.status === 'packed') && (
                        order.bagVerificationStatus === 'verified' ? (
                          <span className="driver-status-pill verified" style={{ padding: '6px 12px' }}>
                            ✓ VERIFIED
                          </span>
                        ) : (
                          <button
                            className="driver-btn-complete primary"
                            style={{ padding: '6px 12px', fontSize: '11px', width: 'auto' }}
                            onClick={() => {
                              setVerifyingOrder(order)
                              setVerifyModalOpen(true)
                              setVerificationError('')
                              setAllOrdersModalOpen(false)
                            }}
                          >
                            <Package size={12} /> Verify
                          </button>
                        )
                      )}
                      <button className="driver-btn-view" onClick={() => handleStartRun(order)}>View</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Return Collection Modal */}
      {returnCollectModalOpen && returnCollectItem && (
        <div className="driver-modal-overlay">
          <div className="driver-modal-content" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="driver-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, textTransform: 'none' }}>
                <RotateCcw size={18}/> Confirm Collection
              </h3>
              <button onClick={() => setReturnCollectModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg)' }}><X size={18}/></button>
            </div>
            
            <div style={{ background: 'var(--color-light-gray)', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>{returnCollectItem.itemName}</div>
              <div style={{ display: 'flex', gap: '12px', color: 'var(--color-muted)', fontSize: '11px' }}>
                <span>Type: <strong style={{ textTransform: 'uppercase' }}>{returnCollectItem.type}</strong></span>
                <span>Qty: <strong>{returnCollectItem.qty}</strong></span>
              </div>
              {returnCollectItem.reason && (
                <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--color-muted)' }}>
                  Reason: {returnCollectItem.reason === 'damaged' ? 'Damaged / Defective' :
                    returnCollectItem.reason === 'wrong' ? 'Wrong Item Sent' :
                    returnCollectItem.reason === 'expiry' ? 'Near Expiry / Expired' :
                    returnCollectItem.reason === 'mind' ? 'Customer Changed Mind' : returnCollectItem.reason}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Driver Note (optional)</label>
              <textarea
                value={returnDriverNote}
                onChange={(e) => setReturnDriverNote(e.target.value)}
                placeholder="Add any notes about the collection..."
                style={{
                  width: '100%', minHeight: '70px', padding: '8px',
                  border: '1.5px solid var(--color-border)', background: 'var(--color-bg)',
                  fontSize: '12px', fontFamily: 'var(--font-picker)', resize: 'none', outline: 'none'
                }}
              />
            </div>

            <div className="driver-info-box">
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Please verify you have physically received the item from the customer before confirming collection.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <button
                className="driver-btn-confirm"
                disabled={returnCollecting}
                onClick={async () => {
                  setReturnCollecting(true)
                  try {
                    await markReturnCollected(
                      activeOrder.id,
                      returnCollectItem.id,
                      user.email,
                      returnDriverNote
                    )
                    // Update local state
                    const updatedItems = activeOrder.returnItems.map(r =>
                      r.id === returnCollectItem.id
                        ? { ...r, status: 'picked up', collectedAt: new Date().toISOString(), collectedBy: user.email, driverNote: returnDriverNote || undefined }
                        : r
                    )
                    setActiveOrder({ ...activeOrder, returnItems: updatedItems })
                    success('Return item collected successfully')
                    setReturnCollectModalOpen(false)
                    loadOrders()
                  } catch (err) {
                    error('Failed to mark return as collected')
                  } finally {
                    setReturnCollecting(false)
                  }
                }}
              >
                <Check size={14} />
                <span>{returnCollecting ? 'Collecting...' : 'Confirm Collected'}</span>
              </button>
              <button className="driver-btn-cancel" onClick={() => setReturnCollectModalOpen(false)}>
                <X size={14} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal for Dashboard View */}
      {verifyModalOpen && verifyingOrder && !activeOrder && (
        <div className="driver-modal-overlay">
          <div className="driver-modal-content" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="driver-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, textTransform: 'none' }}>
                <Package size={18}/> Bag Verification
              </h3>
              <button 
                onClick={() => {
                  setVerifyModalOpen(false)
                  setVerifyingOrder(null)
                  setVerificationError('')
                }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg)' }}
              >
                <X size={18}/>
              </button>
            </div>
            <p className="driver-modal-desc" style={{ textAlign: 'left', marginBottom: '20px' }}>Confirm that physical counts match the values below before starting delivery.</p>
            
            {verificationError && (
              <div className="driver-warning-box" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{verificationError}</span>
              </div>
            )}

            <div className="driver-verification-metrics">
              <div className="metric-box">
                <div className="label">EXPECTED BAGS</div>
                <div className="value">{verifyingOrder.bags}</div>
              </div>
              <div className="metric-box">
                <div className="label">TOTAL ITEMS</div>
                <div className="value">{verifyingOrder.items?.reduce((acc, i) => acc + i.qty, 0) || 0}</div>
              </div>
            </div>

            <div className="driver-info-box">
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Scan or count the physical bags provided to ensure they match the number displayed above.</span>
            </div>
            <div className="driver-warning-box">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Verifying ensures you are accountable only for the items you have physically received.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
              <button 
                className="driver-btn-cancel" 
                disabled={verifying}
                onClick={() => {
                  setVerifyModalOpen(false)
                  setVerifyingOrder(null)
                  setVerificationError('')
                }}
              >
                Back
              </button>
              <button 
                className="driver-btn-confirm" 
                disabled={verifying}
                onClick={handleVerifyBags}
              >
                {verifying ? 'Verifying...' : 'Match & Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
