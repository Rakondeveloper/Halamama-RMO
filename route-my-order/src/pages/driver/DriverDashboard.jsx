import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchOrders, markDelivered, markFailed } from '../../api/orders'
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
  Phone
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import './driver.css'

export function DriverDashboard() {
  const { user } = useAuth()
  const { success, error } = useToast()
  
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeOrder, setActiveOrder] = useState(null)
  const [allOrdersModalOpen, setAllOrdersModalOpen] = useState(false)
  
  // Execution Steps State
  const [step, setStep] = useState(1) // 1: Verify, 2: Navigate, 3: Deliver
  
  // Modals
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [collectedAmount, setCollectedAmount] = useState('')
  const [failureModalOpen, setFailureModalOpen] = useState(false)
  const [failureReason, setFailureReason] = useState('')

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
  }, [])

  const handleStartRun = (order) => {
    setActiveOrder(order)
    if (order.status === 'delivered' || order.status === 'failed') {
      setStep(4) // 4 = Read-only completed state
    } else {
      setStep(1)
    }
  }

  const handleVerifyBags = () => {
    setVerifyModalOpen(false)
    setStep(2)
    success('Bags verified. Ready to start routing.')
  }

  const handleStartDelivery = () => {
    setStep(3)
    success('Delivery started. Customer notified.')
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

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'failed')
  const completedOrdersList = orders.filter(o => o.status === 'delivered')

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="driver-order-id" style={{ fontSize: '18px', fontWeight: '800' }}>{activeOrder.id}</span>
                <span className="driver-status-pill accepted">{activeOrder.status === 'assigned' ? 'accepted' : activeOrder.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {step === 1 ? (
                  <button className="driver-btn-outline" style={{ padding: '6px 12px' }} onClick={() => setVerifyModalOpen(true)}>Verify Bags</button>
                ) : step === 4 ? null : (
                  <span className="driver-status-pill verified"><CheckCircle2 size={12}/> Verified</span>
                )}
              </div>
            </div>
            <div className="driver-summary-date">{activeOrder.date}</div>
          </div>

          {/* Order Items */}
          <div className="driver-summary-card">
            <div className="driver-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '14px' }}>
                <Package size={16}/> Order Items
              </div>
              <div className="driver-badge">{activeOrder.bags} Bags | {activeOrder.items?.reduce((a, b) => a + b.qty, 0) || 0} Items</div>
            </div>
            <div className="driver-items-list">
              {activeOrder.items?.map((item, idx) => (
                <div key={idx} className="driver-item-row">
                  <div className="driver-item-image">
                    <Package size={24} color="var(--color-muted)"/>
                  </div>
                  <div className="driver-item-details">
                    <div className="driver-item-name">{item.name}</div>
                    <div className="driver-item-meta">
                      <span className="driver-item-qty">Qty: {item.qty}</span>
                      <span>•</span>
                      <span className="driver-item-sku">SKU: {item.sku}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div className="driver-summary-card">
             <div className="driver-card-title">Customer</div>
             <div className="driver-customer-name" style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--color-fg)' }}>{activeOrder.customer}</div>
             
             <div className="driver-info-label">Contact information</div>
             <div className="driver-info-value" style={{ marginBottom: '16px', color: 'var(--color-fg)' }}>{activeOrder.phone}</div>
             
             <div className="driver-info-label">Shipping address</div>
             <div className="driver-info-value" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--color-fg)', marginBottom: '16px' }}>
                <div style={{ flex: 1, lineHeight: '1.4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px' }}><User size={14} color="var(--color-muted)"/></div>
                    <strong>{activeOrder.customer}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', marginTop: '2px' }}><MapPin size={14} color="var(--color-muted)"/></div>
                    <div>
                      {activeOrder.address}
                      <div style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '2px' }}>Lat: 25.227891 Lng: 51.494079</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px' }}><Phone size={14} color="var(--color-muted)"/></div>
                     <span>{activeOrder.phone}</span>
                  </div>
                </div>
             </div>

             <div style={{ display: 'flex', gap: '8px' }}>
               <button className="driver-btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', textTransform: 'none', fontWeight: '600' }}>
                 <MapPin size={14} /> Open In Maps
               </button>
               <button className="driver-btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'var(--color-light-gray)', textTransform: 'none', fontWeight: '600' }}>
                 <Phone size={14} /> Call
               </button>
             </div>
          </div>

          {/* Notes */}
          <div className="driver-summary-card">
            <div className="driver-card-title">Notes</div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
              {activeOrder.notes || 'Fast delivery'}
            </div>
          </div>

          {/* Billing Details */}
          <div className="driver-summary-card">
            <div style={{ marginBottom: '16px' }}>
               <span className="driver-status-pill verified" style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none' }}>
                 <Check size={12} /> Paid
               </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
               <span style={{ color: 'var(--color-fg)' }}>Subtotal <span style={{ color: 'var(--color-muted)', marginLeft: '8px' }}>{activeOrder.items?.reduce((a,b)=>a+b.qty, 0) || 0} items</span></span>
               <span style={{ fontWeight: '600' }}>QAR {activeOrder.total}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
               <span style={{ color: 'var(--color-fg)' }}>Discount</span>
               <span style={{ fontWeight: '600', color: 'var(--color-muted)' }}>-QAR 0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '12px', borderBottom: '1.5px solid var(--color-light-gray)', paddingBottom: '12px' }}>
               <span style={{ color: 'var(--color-fg)' }}>Shipping <span style={{ color: 'var(--color-muted)', marginLeft: '8px' }}>Standard Delivery</span></span>
               <span style={{ fontWeight: '600' }}>QAR 0</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
               <span style={{ color: 'var(--color-fg)' }}>Total</span>
               <span style={{ fontWeight: '800' }}>QAR {activeOrder.total}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
               <span style={{ color: 'var(--color-fg)' }}>Paid</span>
               <span style={{ fontWeight: '600' }}>QAR {activeOrder.total}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '4px' }}>
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
                 <button className="driver-btn-complete outline" onClick={() => setFailureModalOpen(true)}>
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
        {verifyModalOpen && (
          <div className="driver-modal-overlay">
            <div className="driver-modal-content" style={{ maxWidth: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="driver-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, textTransform: 'none' }}>
                  <Package size={18}/> Bag Verification
                </h3>
                <button onClick={() => setVerifyModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg)' }}><X size={18}/></button>
              </div>
              <p className="driver-modal-desc" style={{ textAlign: 'left', marginBottom: '20px' }}>Confirm that physical counts match the values below before starting delivery.</p>
              
              <div className="driver-verification-metrics">
                <div className="metric-box">
                  <div className="label">EXPECTED BAGS</div>
                  <div className="value">{activeOrder.bags}</div>
                </div>
                <div className="metric-box">
                  <div className="label">TOTAL ITEMS</div>
                  <div className="value">{activeOrder.items?.reduce((acc, i) => acc + i.qty, 0) || 0}</div>
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
                <button className="driver-btn-cancel" onClick={() => setVerifyModalOpen(false)}>Back</button>
                <button className="driver-btn-confirm" onClick={handleVerifyBags}>Match & Verify</button>
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
              <div className="metric-title">Total Assigned Orders</div>
              <div className="metric-value">{activeOrders.length + completedOrdersList.length}</div>
              <div className="metric-subtitle">Updated just now</div>
            </div>
            <Truck size={20} color="var(--color-muted)" />
          </div>
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>Loading...</div>
        ) : (
          <div className="driver-orders-list">
            {activeOrders.length === 0 && (
               <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px', border: '1.5px solid var(--color-border)' }}>
                 No active orders assigned
               </div>
            )}
            {activeOrders.map(order => (
              <div key={order.id} className="driver-order-card">
                <div className="driver-order-header">
                  <span className="driver-order-id" style={{ fontSize: '14px', fontWeight: '800' }}>{order.id}</span>
                  <span className={`driver-status-pill ${order.status === 'assigned' ? 'accepted' : order.status}`}>{order.status === 'assigned' ? 'accepted' : order.status}</span>
                </div>
                <div className="driver-order-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--color-muted)' }}>
                    <Calendar size={12}/> {order.date}
                  </div>
                  <div style={{ color: 'var(--color-fg)', fontWeight: '600' }}>
                    {order.customer} • {order.customer.split(' ')[0].toLowerCase()}@email.com
                  </div>
                </div>
                <div className="driver-order-footer">
                  <span className="driver-order-total">QAR {order.total}.00</span>
                  <button className="driver-btn-view" onClick={() => handleStartRun(order)}>View</button>
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
                    <span className="driver-order-id" style={{ fontSize: '14px', fontWeight: '800' }}>{order.id}</span>
                    <span className={`driver-status-pill ${order.status === 'assigned' ? 'accepted' : order.status}`}>{order.status === 'assigned' ? 'accepted' : order.status}</span>
                  </div>
                  <div className="driver-order-details">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--color-muted)' }}>
                      <Calendar size={12}/> {order.date}
                    </div>
                    <div style={{ color: 'var(--color-fg)', fontWeight: '600' }}>
                      {order.customer} • {order.customer.split(' ')[0].toLowerCase()}@email.com
                    </div>
                  </div>
                  <div className="driver-order-footer">
                    <span className="driver-order-total">QAR {order.total}.00</span>
                    <button className="driver-btn-view" onClick={() => handleStartRun(order)}>View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
