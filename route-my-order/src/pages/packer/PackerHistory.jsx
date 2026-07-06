import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchOrders } from '../../api/orders'
import {
  Search,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Package,
  Award,
  PackageOpen,
  Eye
} from 'lucide-react'
import './packer.css'

export function PackerHistory() {
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
        const data = await fetchOrders('packer', user.email)
        // Show only orders completed by this packer
        const completed = data.filter(o =>
          o.packedBy === user.email &&
          ['assigning', 'assigned', 'delivered', 'failed'].includes(o.status)
        )
        setOrders(completed)
      } catch (err) {
        console.error('Failed to load packing history', err)
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

  const totalBags = orders.reduce((sum, o) => sum + (o.bags || 1), 0)

  return (
    <div className="packer-container">
      <div className="packer-content">
        <h1 className="page-title" style={{ marginBottom: '12px', fontSize: '20px' }}>Packing History</h1>

        {/* Explain why we use history */}
        <div className="packer-order-card" style={{ backgroundColor: 'var(--color-light-gray)', borderStyle: 'dashed', marginBottom: '16px' }}>
          <div
            onClick={() => setShowExamples(!showExamples)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} />
              <span>Why do Packers use History?</span>
            </div>
            {showExamples ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showExamples && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--color-muted)', textAlign: 'left', lineHeight: '1.4' }}>
              <div>
                <strong>1. Performance Metrics & Shift Logs:</strong>
                <p style={{ margin: '2px 0 0 4px' }}>Track packed item counts, total cartons sealed, and packing speed to verify if you are hitting shift targets and qualifying for incentives.</p>
              </div>
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px' }}>
                <strong>2. Audit Trail for Exceptions:</strong>
                <p style={{ margin: '2px 0 0 4px' }}>If a driver, admin, or customer flags an issue (e.g. missing item, wrong SKU), the packer can reference historical pack logs to verify which items were verified and how many bags were sealed.</p>
              </div>
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px' }}>
                <strong>3. Shift Handover & Verification:</strong>
                <p style={{ margin: '2px 0 0 4px' }}>Provides a solid record of all orders packed during the shift, including bag counts. Great for resolving discrepancy reports with admin staff during check-out.</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary metrics for history */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div className="packer-metric-card" style={{ flex: 1, padding: '10px' }}>
            <div className="packer-metric-icon"><PackageOpen size={14} /></div>
            <div>
              <div className="packer-metric-value">{orders.length}</div>
              <div className="packer-metric-label">Packed</div>
            </div>
          </div>
          <div className="packer-metric-card" style={{ flex: 1, padding: '10px' }}>
            <div className="packer-metric-icon"><Package size={14} /></div>
            <div>
              <div className="packer-metric-value">{totalBags}</div>
              <div className="packer-metric-label">Bags</div>
            </div>
          </div>
          <div className="packer-metric-card" style={{ flex: 1, padding: '10px' }}>
            <div className="packer-metric-icon"><Award size={14} /></div>
            <div>
              <div className="packer-metric-value">100%</div>
              <div className="packer-metric-label">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="packer-search-container" style={{ marginBottom: '16px' }}>
          <Search className="packer-search-icon" size={16} />
          <input
            type="text"
            placeholder="Search completed orders..."
            className="packer-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List of Orders */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-muted)', fontSize: '12px' }}>Loading packing history...</div>
        ) : (
          <div>
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--color-muted)', fontSize: '12px' }}>
                No past orders found in this shift.
              </div>
            ) : (
              filteredOrders.map(order => {
                const packedCount = order.items ? order.items.filter(i => i.picked).length : 0
                const totalCount = order.items ? order.items.length : 0
                const isExpanded = expandedOrder === order.id

                return (
                  <div key={order.id} className="packer-order-card">
                    <div className="packer-order-header">
                      <div className="packer-order-id">{order.id}</div>
                      <div className="packer-order-items-count" style={{ color: 'black', fontWeight: 'bold' }}>
                        {packedCount}/{totalCount} items
                      </div>
                    </div>
                    <div className="packer-order-customer">{order.customer} • {order.phone}</div>
                    <div className="packer-order-date">{order.date || '5/20/2026 • 08:11 AM'}</div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid black', paddingTop: '8px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', border: '1px solid black', fontSize: '11px', fontWeight: 'bold' }}>
                          <CheckCircle2 size={12} /> {packedCount} Packed
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', border: '1px solid black', fontSize: '11px', fontWeight: 'bold' }}>
                          <Package size={12} /> {order.bags || 1} Bag{(order.bags || 1) > 1 ? 's' : ''}
                        </div>
                      </div>
                      <button
                        className="packer-btn-view"
                        style={{ fontSize: '11px', padding: '4px 10px', flex: 'none' }}
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
                          Packed Items ({totalCount})
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', color: item.picked ? 'var(--color-fg)' : 'var(--color-muted)' }}>
                              <CheckCircle2 size={12} /> {item.picked ? 'Verified' : 'Pending'}
                            </div>
                          </div>
                        ))}
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', fontSize: '11px', fontWeight: '700', padding: '6px 0', borderTop: '1.5px solid var(--color-border)' }}>
                          <span style={{ color: 'var(--color-muted)' }}>Completed Pack</span>
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
