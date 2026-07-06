import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchOrders } from '../../api/orders'
import {
  Search,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  Award,
  Eye,
  MapPin,
  Calendar,
  RotateCcw,
  Check
} from 'lucide-react'
import './driver.css'

export function DriverHistory() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)
      try {
        const data = await fetchOrders('driver', user.email)
        // Show only delivered or failed orders
        const completed = data.filter(o =>
          ['delivered', 'failed'].includes(o.status)
        )
        setOrders(completed)
      } catch (err) {
        console.error('Failed to load delivery history', err)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [user.email])

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deliveredCount = orders.filter(o => o.status === 'delivered').length
  const failedCount = orders.filter(o => o.status === 'failed').length
  const deliveryRate = orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 0
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="driver-container">
      <div className="driver-content">
        <h1 className="page-title" style={{ marginBottom: '12px', fontSize: '20px' }}>Delivery History</h1>

        {/* Explain why we use history */}
        <div className="driver-order-card" style={{ backgroundColor: 'var(--color-light-gray)', borderStyle: 'dashed', marginBottom: '16px' }}>
          <div
            onClick={() => setShowExamples(!showExamples)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} />
              <span>Why do Drivers use History?</span>
            </div>
            {showExamples ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showExamples && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--color-muted)', textAlign: 'left', lineHeight: '1.4' }}>
              <div>
                <strong>1. Proof of Delivery (POD) Audit:</strong>
                <p style={{ margin: '2px 0 0 4px' }}>Track payments received (POS Card, Cash, Payment Link) and payment balances. Useful for end-of-shift cash reconciliation with the admin.</p>
              </div>
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px' }}>
                <strong>2. Delivery Exceptions Tracking:</strong>
                <p style={{ margin: '2px 0 0 4px' }}>Log failed delivery reasons (customer unreachable, rejected, wrong address) to protect your driver rating and resolve disputes with the operations team.</p>
              </div>
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px' }}>
                <strong>3. Shift Reconciliation & Bag Returns:</strong>
                <p style={{ margin: '2px 0 0 4px' }}>Provides a clear record of all deliveries completed during the shift, including bag counts and total collected amounts for smooth end-of-shift checkout.</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary metrics for history */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <div className="driver-metric-card" style={{ padding: '10px' }}>
            <div className="driver-metric-icon"><Truck size={14} /></div>
            <div>
              <div className="driver-metric-value">{deliveredCount}</div>
              <div className="driver-metric-label">Delivered</div>
            </div>
          </div>
          <div className="driver-metric-card" style={{ padding: '10px' }}>
            <div className="driver-metric-icon"><XCircle size={14} /></div>
            <div>
              <div className="driver-metric-value">{failedCount}</div>
              <div className="driver-metric-label">Failed</div>
            </div>
          </div>
          <div className="driver-metric-card" style={{ padding: '10px' }}>
            <div className="driver-metric-icon"><Award size={14} /></div>
            <div>
              <div className="driver-metric-value">{deliveryRate}%</div>
              <div className="driver-metric-label">Success</div>
            </div>
          </div>
          <div className="driver-metric-card" style={{ padding: '10px' }}>
            <div className="driver-metric-icon"><Package size={14} /></div>
            <div>
              <div className="driver-metric-value">{totalRevenue}</div>
              <div className="driver-metric-label">QAR Total</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-fg)' }} size={16} />
          <input
            type="text"
            placeholder="Search deliveries..."
            style={{
              width: '100%',
              background: 'var(--color-bg)',
              border: '1.5px solid var(--color-border)',
              padding: '8px 8px 8px 32px',
              fontSize: '12px',
              fontWeight: '500',
              outline: 'none',
              fontFamily: 'var(--font-picker)'
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List of Orders */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-muted)', fontSize: '12px' }}>Loading delivery history...</div>
        ) : (
          <div>
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--color-muted)', fontSize: '12px' }}>
                No past deliveries found in this shift.
              </div>
            ) : (
              filteredOrders.map(order => {
                const totalItems = order.items ? order.items.reduce((sum, i) => sum + i.qty, 0) : 0
                const isExpanded = expandedOrder === order.id
                const isDelivered = order.status === 'delivered'

                return (
                  <div key={order.id} className="driver-order-card">
                    <div className="driver-order-header">
                      <span className="driver-order-id" style={{ fontSize: '14px', fontWeight: '800' }}>{order.id}</span>
                      <span className={`driver-status-pill ${isDelivered ? 'accepted' : ''}`}
                        style={!isDelivered ? { borderStyle: 'dashed' } : {}}
                      >
                        {isDelivered ? (
                          <><CheckCircle2 size={10} /> Delivered</>
                        ) : (
                          <><XCircle size={10} /> Failed</>
                        )}
                      </span>
                    </div>

                    <div className="driver-order-details" style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: 'var(--color-muted)', fontSize: '11px' }}>
                        <Calendar size={12} /> {order.date}
                      </div>
                      <div style={{ color: 'var(--color-fg)', fontWeight: '600', fontSize: '12px' }}>
                        {order.customer} • {order.phone}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-muted)', fontSize: '11px', marginTop: '2px' }}>
                        <MapPin size={11} /> {order.address}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid black', paddingTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', border: '1px solid black', fontSize: '11px', fontWeight: 'bold' }}>
                          <Package size={12} /> {order.bags || 1} Bag{(order.bags || 1) > 1 ? 's' : ''}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800' }}>QAR {order.total}.00</span>
                      </div>
                      <button
                        className="driver-btn-view"
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      >
                        <Eye size={12} />
                        <span>{isExpanded ? 'Hide' : 'Detail'}</span>
                      </button>
                    </div>

                    {/* Expanded item details */}
                    {isExpanded && (
                      <div style={{ marginTop: '10px', borderTop: '1px dashed var(--color-border)', paddingTop: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--color-muted)' }}>
                          Order Items ({totalItems})
                        </div>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: idx < order.items.length - 1 ? '1px solid var(--color-light-gray)' : 'none' }}>
                            <div style={{ width: '36px', height: '36px', background: 'var(--color-light-gray)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Package size={16} color="var(--color-muted)" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '12px', fontWeight: '700' }}>
                                <span style={{ fontWeight: '800', textDecoration: 'underline' }}>{item.qty}x</span> {item.name}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--color-muted)' }}>SKU: {item.sku}</div>
                            </div>
                          </div>
                        ))}

                        {/* Returns / Collections */}
                        {order.returnItems && order.returnItems.length > 0 && (
                          <div style={{ marginTop: '12px', borderTop: '1px dashed var(--color-border)', paddingTop: '10px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <RotateCcw size={12} /> Returns & Collections ({order.returnItems.length})
                            </div>
                            {order.returnItems.map((ret, idx) => (
                              <div key={ret.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: idx < order.returnItems.length - 1 ? '1px solid var(--color-light-gray)' : 'none' }}>
                                <div style={{ width: '36px', height: '36px', background: 'var(--color-light-gray)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <RotateCcw size={16} color="var(--color-muted)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '12px', fontWeight: '700' }}>
                                    <span style={{ fontWeight: '800' }}>{ret.qty}x</span> {ret.itemName}
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                    <span>SKU: {ret.sku || '—'}</span>
                                    <span>•</span>
                                    <span style={{ textTransform: 'uppercase' }}>{ret.type}</span>
                                    <span>•</span>
                                    <span style={{
                                      color: ret.status === 'pending' ? '#b45309' : '#16a34a',
                                      fontWeight: '600'
                                    }}>
                                      {ret.status === 'picked up' ? 'Collected' : ret.status === 'completed' ? 'Completed' : 'Pending Collection'}
                                    </span>
                                  </div>
                                  {ret.driverNote && (
                                    <div style={{ fontSize: '10px', fontStyle: 'italic', color: 'var(--color-muted)', marginTop: '2px' }}>
                                      Note: "{ret.driverNote}"
                                    </div>
                                  )}
                                  {ret.collectedAt && (
                                    <div style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                      Collected: {new Date(ret.collectedAt).toLocaleDateString()} {new Date(ret.collectedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Billing summary */}
                        <div style={{ marginTop: '8px', padding: '10px 0 0', borderTop: '1.5px solid var(--color-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                            <span>Subtotal</span>
                            <span style={{ fontWeight: '600' }}>QAR {order.total}.00</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--color-muted)' }}>Shipping</span>
                            <span style={{ fontWeight: '600' }}>QAR 0</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', paddingTop: '6px', borderTop: '1px solid var(--color-light-gray)' }}>
                            <span>Total</span>
                            <span>QAR {order.total}.00</span>
                          </div>
                        </div>

                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                            {isDelivered ? 'Completed Delivery' : 'Delivery Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
