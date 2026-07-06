import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchOrders } from '../../api/orders'
import {
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  Package,
  Award
} from 'lucide-react'
import './picker.css'

export function PickerHistory() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showExamples, setShowExamples] = useState(false)

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)
      try {
        const data = await fetchOrders('picker', user.email)
        // Show only orders completed by this picker
        const completed = data.filter(o => 
          (o.status === 'packed' || o.status === 'assigning' || o.status === 'assigned' || o.status === 'delivered') && 
          o.pickedBy === user.email
        )
        setOrders(completed)
      } catch (err) {
        console.error('Failed to load picking history', err)
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

  return (
    <div className="picker-container">
      <div className="picker-content">
        <h1 className="page-title" style={{ marginBottom: '12px', fontSize: '20px' }}>Picking History</h1>

        {/* Explain why we use history */}
        <div className="picker-order-card" style={{ backgroundColor: 'var(--color-light-gray)', borderStyle: 'dashed', marginBottom: '16px' }}>
          <div 
            onClick={() => setShowExamples(!showExamples)} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} />
              <span>Why do Pickers use History?</span>
            </div>
            {showExamples ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showExamples && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--color-muted)', textAlign: 'left', lineHeight: '1.4' }}>
              <div>
                <strong>1. Performance Tracking & Metrics:</strong>
                <p style={{ margin: '2px 0 0 4px' }}>Track daily picking rates, total orders served, and speed/accuracy performance to verify if you are hitting shift targets and qualifiers for incentives.</p>
              </div>
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px' }}>
                <strong>2. Quality Audits & Error Resolution:</strong>
                <p style={{ margin: '2px 0 0 4px' }}>If a packer, admin, or driver flags an issue (e.g. damaged formula canister, missing diaper pack), the picker can reference the historical pick logs to verify which SKU was scanned and resolve disputes.</p>
              </div>
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px' }}>
                <strong>3. Shift Handover & Verification:</strong>
                <p style={{ margin: '2px 0 0 4px' }}>Provides a solid record of all orders completed during the shift. Great for resolving discrepancy reports with admin staff during check-out.</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary metrics for history */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div className="picker-metric-card" style={{ flex: 1, padding: '10px' }}>
            <div className="picker-metric-icon"><Package size={14} /></div>
            <div>
              <div className="picker-metric-value">{orders.length}</div>
              <div className="picker-metric-label">Picked</div>
            </div>
          </div>
          <div className="picker-metric-card" style={{ flex: 1, padding: '10px' }}>
            <div className="picker-metric-icon"><Award size={14} /></div>
            <div>
              <div className="picker-metric-value">100%</div>
              <div className="picker-metric-label">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="picker-search-container" style={{ marginBottom: '16px' }}>
          <Search className="picker-search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search completed orders..." 
            className="picker-search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List of Orders */}
        {loading ? (
          <div>Loading picking history...</div>
        ) : (
          <div>
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--color-muted)', fontSize: '12px' }}>
                No past orders found in this shift.
              </div>
            ) : (
              filteredOrders.map(order => {
                const pickedCount = order.items ? order.items.filter(i => i.picked).length : 0
                const totalCount = order.items ? order.items.length : 0
                return (
                  <div key={order.id} className="picker-order-card">
                    <div className="picker-order-header">
                      <div className="picker-order-id">{order.id}</div>
                      <div className="picker-order-items-count" style={{ color: 'black', fontWeight: 'bold' }}>
                        {pickedCount}/{totalCount} items
                      </div>
                    </div>
                    <div className="picker-order-customer">{order.customer} • {order.phone}</div>
                    <div className="picker-order-date">{order.date || '5/20/2026 • 08:11 AM'}</div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid black', paddingTop: '8px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', border: '1px solid black', fontSize: '11px', fontWeight: 'bold' }}>
                        <CheckCircle2 size={12} /> {pickedCount} Picked
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: 'bold' }}>
                        Completed Pick
                      </span>
                    </div>
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
