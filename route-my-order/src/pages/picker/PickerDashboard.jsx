import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchOrders, assignOrder, updateItemPickStatus, completePicking, flagOrderIssue } from '../../api/orders'
import {
  Package,
  Flag,
  ArrowLeft,
  Search,
  Calendar,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Eye,
  Clock,
  CheckSquare,
  Check,
  X
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import './picker.css'

export function PickerDashboard() {
  const { user } = useAuth()
  const { success, error } = useToast()

  const [activeTab, setActiveTab] = useState('New')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeOrder, setActiveOrder] = useState(null)

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDays, setFilterDays] = useState(30)

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [orderToAssign, setOrderToAssign] = useState(null)
  const [flagNote, setFlagNote] = useState('')
  const [flagItemSku, setFlagItemSku] = useState(null)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await fetchOrders('picker', user.email)
      setOrders(data)
    } catch (err) {
      error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleConfirmAssign = async () => {
    if (!orderToAssign) return
    try {
      await assignOrder(orderToAssign.id, user.email, 'picker')
      success('Order assigned to you')
      loadOrders()
      setActiveTab('Mine')
    } catch (err) {
      error('Failed to assign order')
    } finally {
      setAssignModalOpen(false)
      setOrderToAssign(null)
    }
  }

  const toggleItemPick = async (orderId, sku, picked) => {
    try {
      await updateItemPickStatus(orderId, sku, picked)
      if (activeOrder) {
        setActiveOrder({
          ...activeOrder,
          items: activeOrder.items.map(i => i.sku === sku ? { ...i, picked } : i)
        })
      }
    } catch (err) {
      error('Failed to update item')
    }
  }

  const handleComplete = async (orderId) => {
    try {
      await completePicking(orderId, user.email, user.name)
      success('Picking completed.')
      setActiveOrder(null)
      loadOrders()
      setActiveTab('Completed')
    } catch (err) {
      error('Failed to complete picking')
    }
  }

  const handleFlag = async () => {
    if (!flagNote || !flagItemSku) return
    try {
      await flagOrderIssue(activeOrder.id, `[${flagItemSku}] ${flagNote}`)
      success('Item flagged. Admin notified.')
      setFlagNote('')
      setFlagItemSku(null)
    } catch (err) {
      error('Failed to flag item')
    }
  }

  // Filter definitions
  const newOrders = orders.filter(o => o.status === 'new')
  const myOrders = orders.filter(o => o.status === 'picking' && o.assignedTo === user.email)
  const completedOrders = orders.filter(o => 
    (o.status === 'packed' || o.status === 'assigning' || o.status === 'assigned' || o.status === 'delivered') && 
    o.pickedBy === user.email
  )
  const allOrders = orders

  // Dynamic date range filter helper
  const matchesDays = (orderDate) => {
    if (filterDays === 30) return true
    if (filterDays === 7) {
      // 7 Days: only show orders from 5/19 and 5/20 (ignore 4/28)
      return orderDate && (orderDate.includes('5/19/2026') || orderDate.includes('5/20/2026'))
    }
    return true
  }

  const filterBySearchAndDays = (list) => {
    return list.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.customer.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTime = matchesDays(o.date)
      return matchesSearch && matchesTime
    })
  }

  const filteredCompletedOrders = filterBySearchAndDays(completedOrders)
  const filteredAllOrders = filterBySearchAndDays(allOrders)

  const getTabCount = (tab) => {
    switch (tab) {
      case 'New': return newOrders.length
      case 'Mine': return myOrders.length
      case 'Completed': return completedOrders.length
      case 'All': return allOrders.length
      default: return 0
    }
  }

  if (activeOrder) {
    const pickedCount = activeOrder.items.filter(i => i.picked).length
    const totalCount = activeOrder.items.length
    const allPicked = pickedCount === totalCount
    const progress = (pickedCount / totalCount) * 100

    return (
      <div className="picker-detail-view">
        {/* Fixed Header */}
        <div className="picker-header">
          <button onClick={() => setActiveOrder(null)} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </button>
          <h2 className="picker-header-title">{activeOrder.id}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="picker-avatar">{user.name.charAt(0)}</div>
            <div className="picker-user-info">
              <div className="picker-user-name">{user.name}</div>
              <div className="picker-user-role">Picker</div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="picker-detail-body">
          {/* Warning Banner */}
          <div className="picker-warning-banner">
            <AlertTriangle className="picker-warning-icon" size={16} />
            <div>
              <div className="picker-warning-title">Order Updated in Shopify</div>
              <div className="picker-warning-text">New items were added to this order. Please pick or flag them to continue.</div>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="picker-customer-card">
            <div className="picker-customer-header">
              <div>
                <div className="picker-customer-name">{activeOrder.customer}</div>
                <div className="picker-customer-phone">{activeOrder.phone}</div>
                <div className="picker-customer-date">{activeOrder.date || '5/20/2026 • 08:11 AM'}</div>
              </div>
              <div>
                <div className="picker-customer-total">{activeOrder.total}.00</div>
                <div className="picker-customer-stats">Picked {pickedCount}/{totalCount} units</div>
                <div className="picker-customer-stats">{pickedCount}/{totalCount} items</div>
              </div>
            </div>
            <div className="picker-progress-bar">
              <div className="picker-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* Items List */}
          <div className="picker-items-container">
            <div className="picker-items-header">
              Items ({totalCount})
            </div>

            <div>
              {activeOrder.items.map(item => (
                <div key={item.sku} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1.5px solid var(--color-border)' }}>
                  <div className="picker-item-row" style={{ borderBottom: 'none' }}>
                    {/* Flag Icon */}
                    <button
                      className="picker-item-flag"
                      style={{ color: flagItemSku === item.sku ? '#ef4444' : 'var(--color-fg)' }}
                      onClick={() => {
                        if (flagItemSku === item.sku) {
                          setFlagItemSku(null);
                          setFlagNote('');
                        } else {
                          setFlagItemSku(item.sku);
                          setFlagNote('');
                        }
                      }}
                    >
                      <Flag size={14} fill="currentColor" />
                    </button>

                    <div className="picker-item-img-container">
                      <img src="https://placehold.co/100x100/eeeeee/cccccc?text=Product" className="picker-item-img" alt="Product" />
                    </div>

                    <div className="picker-item-details">
                      <div className="picker-item-name">
                        <span className="picker-item-qty">{item.qty}x</span> {item.name}
                        <span className="picker-item-picked-status">({item.picked ? '1/1' : '0/1'})</span>
                      </div>
                      <div className="picker-item-meta">
                        SKU: {item.sku} • Barcode: 0-72239-30639-0
                      </div>

                      <button
                        className={`picker-item-toggle ${item.picked ? 'active' : ''}`}
                        onClick={() => toggleItemPick(activeOrder.id, item.sku, !item.picked)}
                      >
                        <div className="picker-check-circle">
                          {item.picked && <CheckCircle2 size={10} />}
                        </div>
                        <span>{item.picked ? 'Picked' : 'Not picked'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Flagging Box */}
                  {flagItemSku === item.sku && (
                    <div style={{ padding: '0 12px 12px 12px' }}>
                      <div className="picker-flag-box">
                        <textarea
                          placeholder="Describe the issue..."
                          className="picker-flag-textarea"
                          value={flagNote}
                          onChange={(e) => setFlagNote(e.target.value)}
                        />
                        <div className="picker-flag-actions">
                          <button className="picker-btn-flag-submit" onClick={handleFlag}>
                            Flag Issue
                          </button>
                          <button className="picker-btn-flag-cancel" onClick={() => { setFlagItemSku(null); setFlagNote(''); }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Sticky Action inside the fixed overlay to remain visible & clickable */}
        <div className="picker-bottom-action">
          <div className="picker-bottom-action-inner">
            <button
              className={`picker-btn-complete ${allPicked ? 'ready' : 'not-ready'}`}
              disabled={!allPicked}
              onClick={() => handleComplete(activeOrder.id)}
            >
              {allPicked ? (
                <>
                  <CheckSquare size={14} />
                  <span>Complete Picking</span>
                </>
              ) : (
                <>
                  <Clock size={14} />
                  <span>{totalCount - pickedCount} item(s) remaining</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="picker-container">
      <div className="picker-content">
        {/* Top Metrics */}
        <div className="picker-metrics">
          <div className="picker-metric-card">
            <div className="picker-metric-icon">
              <Package size={14} />
            </div>
            <div>
              <div className="picker-metric-value">{newOrders.length}</div>
              <div className="picker-metric-label">New Orders</div>
            </div>
          </div>
          <div className="picker-metric-card">
            <div className="picker-metric-icon">
              <CheckSquare size={14} />
            </div>
            <div>
              <div className="picker-metric-value">{myOrders.length + completedOrders.length}</div>
              <div className="picker-metric-label">Total Served</div>
            </div>
          </div>
          <div className="picker-metric-card">
            <div className="picker-metric-icon">
              <Clock size={14} />
            </div>
            <div>
              <div className="picker-metric-value">{myOrders.length}</div>
              <div className="picker-metric-label">My Active</div>
            </div>
          </div>
          <div className="picker-metric-card">
            <div className="picker-metric-icon">
              <CheckCircle2 size={14} />
            </div>
            <div>
              <div className="picker-metric-value">{completedOrders.length}</div>
              <div className="picker-metric-label">Completed</div>
            </div>
          </div>
        </div>

        <div className="picker-shift-text">
          Shift: Apr 20 – May 20 (Last 30 Days)
        </div>

        {/* Tabs */}
        <div className="picker-tabs">
          {['New', 'Mine', 'Completed', 'All'].map(tab => (
            <button
              key={tab}
              className={`picker-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="picker-tab-badge">
                {getTabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filters (Shown on Completed/All) */}
        {(activeTab === 'Completed' || activeTab === 'All') && (
          <div style={{ marginBottom: '12px' }}>
            <div className="picker-search-container">
              <Search className="picker-search-icon" size={16} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="picker-search-input" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="picker-filters">
              <button 
                className={`picker-filter-btn ${filterDays === 7 ? 'active' : ''}`}
                onClick={() => setFilterDays(7)}
              >
                7 Days
              </button>
              <button 
                className={`picker-filter-btn ${filterDays === 30 ? 'active' : ''}`}
                onClick={() => setFilterDays(30)}
              >
                30 Days
              </button>
              <button className="picker-filter-btn">
                <Calendar size={12} /> Apr 20 - May 20 <ChevronDown size={12} />
              </button>
            </div>
          </div>
        )}

        {/* List of Orders */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {activeTab === 'New' && newOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>No new orders</div>
            )}

            {activeTab === 'New' && newOrders.map(order => {
              const pickedCount = order.items ? order.items.filter(i => i.picked).length : 0
              const totalCount = order.items ? order.items.length : 0
              return (
                <div key={order.id} className="picker-order-card">
                  <div className="picker-order-header">
                    <div className="picker-order-id">{order.id}</div>
                    <div className="picker-order-items-count">{pickedCount}/{totalCount} items</div>
                  </div>
                  <div className="picker-order-customer">{order.customer} • {order.phone}</div>
                  <div className="picker-order-date">{order.date || '5/20/2026 • 08:11 AM'}</div>

                  <div className="picker-order-actions">
                    <button
                      className="picker-btn-assign"
                      onClick={() => { setOrderToAssign(order); setAssignModalOpen(true); }}
                    >
                      <UserPlus size={14} />
                      <span>Assign to Me</span>
                    </button>
                    <button
                      className="picker-btn-view"
                      onClick={() => setActiveOrder(order)}
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              )
            })}

            {activeTab === 'Mine' && myOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>You have no active orders</div>
            )}

            {activeTab === 'Mine' && myOrders.map(order => {
              const pickedCount = order.items ? order.items.filter(i => i.picked).length : 0
              const totalCount = order.items ? order.items.length : 0
              return (
                <div key={order.id} className="picker-order-card">
                  <div className="picker-order-header">
                    <div className="picker-order-id">{order.id}</div>
                    <div className="picker-order-items-count">{pickedCount}/{totalCount} items</div>
                  </div>
                  <div className="picker-order-customer">{order.customer} • {order.phone}</div>
                  <div className="picker-order-date">{order.date || '5/20/2026 • 08:11 AM'}</div>

                  <div className="picker-order-actions">
                    <button
                      className="picker-btn-view"
                      onClick={() => setActiveOrder(order)}
                    >
                      <Eye size={14} />
                      <span>View Order</span>
                    </button>
                  </div>
                </div>
              )
            })}

            {activeTab === 'Completed' && filteredCompletedOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>No completed orders found</div>
            )}

            {activeTab === 'Completed' && filteredCompletedOrders.map(order => {
              const pickedCount = order.items ? order.items.filter(i => i.picked).length : 0
              const totalCount = order.items ? order.items.length : 0
              return (
                <div key={order.id} className="picker-order-card">
                  <div className="picker-order-header">
                    <div className="picker-order-id">{order.id}</div>
                    <div className="picker-order-items-count" style={{ color: 'black', fontWeight: 'bold' }}>{pickedCount}/{totalCount} items</div>
                  </div>
                  <div className="picker-order-customer">{order.customer} • {order.phone}</div>
                  <div className="picker-order-date">{order.date || '5/20/2026 • 08:11 AM'}</div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid black', paddingTop: '8px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', border: '1px solid black', fontSize: '11px', fontWeight: 'bold' }}>
                      <CheckCircle2 size={12} /> {pickedCount} Picked
                    </div>
                    <button
                      className="picker-btn-view"
                      style={{ fontSize: '11px', padding: '4px 10px', flex: 'none' }}
                      onClick={() => setActiveOrder(order)}
                    >
                      <Eye size={12} />
                      <span>View Detail</span>
                    </button>
                  </div>
                </div>
              )
            })}

            {activeTab === 'All' && filteredAllOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>No orders found</div>
            )}

            {activeTab === 'All' && filteredAllOrders.map(order => {
              const pickedCount = order.items ? order.items.filter(i => i.picked).length : 0
              const totalCount = order.items ? order.items.length : 0
              const isCompleted = order.status === 'packed' || order.status === 'assigning' || order.status === 'assigned' || order.status === 'delivered' || order.status === 'failed'
              const isMineActive = order.status === 'picking' && order.assignedTo === user.email
              const isNew = order.status === 'new'
              const isOtherActive = order.status === 'picking' && order.assignedTo && order.assignedTo !== user.email

              return (
                <div key={order.id} className="picker-order-card">
                  <div className="picker-order-header">
                    <div className="picker-order-id">{order.id}</div>
                    <div className="picker-order-items-count" style={isCompleted ? { color: 'black', fontWeight: 'bold' } : {}}>
                      {pickedCount}/{totalCount} items
                    </div>
                  </div>
                  <div className="picker-order-customer">{order.customer} • {order.phone}</div>
                  <div className="picker-order-date">{order.date || '5/20/2026 • 08:11 AM'}</div>

                  {isNew && (
                    <div className="picker-order-actions">
                      <button
                        className="picker-btn-assign"
                        onClick={() => { setOrderToAssign(order); setAssignModalOpen(true); }}
                      >
                        <UserPlus size={14} />
                        <span>Assign to Me</span>
                      </button>
                      <button
                        className="picker-btn-view"
                        onClick={() => setActiveOrder(order)}
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </div>
                  )}

                  {isMineActive && (
                    <div className="picker-order-actions">
                      <button
                        className="picker-btn-view"
                        onClick={() => setActiveOrder(order)}
                      >
                        <Eye size={14} />
                        <span>View Order</span>
                      </button>
                    </div>
                  )}

                  {isOtherActive && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid black', paddingTop: '8px', marginTop: '4px' }}>
                      <button
                        className="picker-btn-view"
                        style={{ fontSize: '11px', padding: '4px 10px', flex: 'none' }}
                        onClick={() => setActiveOrder(order)}
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                      <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 'bold' }}>
                        Picker: {order.pickerName || order.assignedTo.split('@')[0]}
                      </span>
                    </div>
                  )}

                  {isCompleted && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid black', paddingTop: '8px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', border: '1px solid black', fontSize: '11px', fontWeight: 'bold' }}>
                        <CheckCircle2 size={12} /> {pickedCount} Picked
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="picker-btn-view"
                          style={{ fontSize: '11px', padding: '4px 10px', flex: 'none' }}
                          onClick={() => setActiveOrder(order)}
                        >
                          <Eye size={12} />
                          <span>View Detail</span>
                        </button>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 'bold' }}>
                          Picker: {order.pickerName || (order.pickedBy === user.email ? user.name : 'nijad')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignModalOpen && (
        <div className="picker-modal-overlay">
          <div className="picker-modal-content">
            <h3 className="picker-modal-title">Assign Order to You?</h3>
            <p className="picker-modal-desc">Are you sure you want to assign order <strong>{orderToAssign?.id}</strong> to yourself?</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="picker-btn-confirm"
                onClick={handleConfirmAssign}
              >
                <Check size={14} />
                <span>Yes, Assign Order</span>
              </button>
              <button
                className="picker-btn-cancel"
                onClick={() => setAssignModalOpen(false)}
              >
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
