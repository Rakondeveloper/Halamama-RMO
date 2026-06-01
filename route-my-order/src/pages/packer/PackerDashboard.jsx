import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchOrders, assignOrder, completePacking, flagOrderIssue } from '../../api/orders'
import {
  PackageOpen,
  CheckSquare,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Eye,
  Package,
  Search,
  Check,
  X,
  UserPlus,
  Flag,
  Calendar,
  ChevronDown
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import './packer.css'

export function PackerDashboard() {
  const { user } = useAuth()
  const { success, error } = useToast()
  
  const [activeTab, setActiveTab] = useState('New')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeOrder, setActiveOrder] = useState(null)
  
  const [checkedItems, setCheckedItems] = useState({})
  const [bags, setBags] = useState('')

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDays, setFilterDays] = useState(30)

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [orderToAssign, setOrderToAssign] = useState(null)

  // Flag states
  const [flagNote, setFlagNote] = useState('')
  const [flagItemSku, setFlagItemSku] = useState(null)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await fetchOrders('packer', user.email)
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
      await assignOrder(orderToAssign.id, user.email, 'packer')
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

  const handleStartPacking = (order) => {
    setActiveOrder(order)
    const initialChecks = {}
    order.items.forEach(i => initialChecks[i.sku] = false)
    setCheckedItems(initialChecks)
    setBags('')
    setFlagItemSku(null)
    setFlagNote('')
  }

  const handleComplete = async (orderId) => {
    const bagCount = parseInt(bags)
    if (isNaN(bagCount) || bagCount < 1) {
      error('Please enter a valid number of bags')
      return
    }
    
    try {
      await completePacking(orderId, bagCount, user.email, user.name)
      success(`Packing completed! Marked as ${bagCount} bag(s).`)
      setActiveOrder(null)
      loadOrders()
      setActiveTab('Completed')
    } catch (err) {
      error('Failed to complete packing')
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
  // New: packed orders not assigned to any packer yet
  const newOrders = orders.filter(o => o.status === 'packed' && !o.packedBy)
  // Mine: orders assigned to this packer currently being packed
  const myOrders = orders.filter(o => o.status === 'packing' && o.assignedTo === user.email)
  // Completed: orders packed by this user (status beyond packing)
  const completedOrders = orders.filter(o =>
    o.packedBy === user.email &&
    ['assigning', 'assigned', 'delivered', 'failed'].includes(o.status)
  )
  // All: every order returned by the API
  const allOrders = orders

  // Date filter helper
  const matchesDays = (orderDate) => {
    if (filterDays === 30) return true
    if (filterDays === 7) {
      return orderDate && (orderDate.includes('5/19/2026') || orderDate.includes('5/20/2026') || orderDate.includes('5/21/2026') || orderDate.includes('5/22/2026'))
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

  const filteredCompleted = filterBySearchAndDays(completedOrders)
  const filteredAll = filterBySearchAndDays(allOrders)

  const getTabCount = (tab) => {
    switch (tab) {
      case 'New': return newOrders.length
      case 'Mine': return myOrders.length
      case 'Completed': return completedOrders.length
      case 'All': return allOrders.length
      default: return 0
    }
  }

  // ─── Detail view (packing mode) ───
  if (activeOrder) {
    const allChecked = Object.values(checkedItems).every(v => v === true)
    const checkedCount = Object.values(checkedItems).filter(v => v).length
    const totalCount = activeOrder.items.length
    const progress = (checkedCount / totalCount) * 100
    const canComplete = allChecked && bags && parseInt(bags) > 0

    return (
      <div className="packer-detail-view">
        {/* Fixed Header */}
        <div className="packer-header">
          <button onClick={() => setActiveOrder(null)} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </button>
          <h2 className="packer-header-title">{activeOrder.id}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="packer-avatar">{user.name.charAt(0)}</div>
            <div className="packer-user-info">
              <div className="packer-user-name">{user.name}</div>
              <div className="packer-user-role">Packer</div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="packer-detail-body">
          {/* Customer Info Card */}
          <div className="packer-customer-card">
            <div className="packer-customer-header">
              <div>
                <div className="packer-customer-name">{activeOrder.customer}</div>
                <div className="packer-customer-phone">{activeOrder.phone}</div>
                <div className="packer-customer-date">{activeOrder.date || '5/20/2026 • 08:11 AM'}</div>
              </div>
              <div>
                <div className="packer-customer-total">{activeOrder.total}.00</div>
                <div className="packer-customer-stats">Verified {checkedCount}/{totalCount} items</div>
              </div>
            </div>
            <div className="packer-progress-bar">
              <div className="packer-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* Items List */}
          <div className="packer-items-container">
            <div className="packer-items-header">
              Verify Items ({totalCount})
            </div>

            <div>
              {activeOrder.items.map(item => (
                <div key={item.sku} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1.5px solid var(--color-border)' }}>
                  <div className="packer-item-row" style={{ borderBottom: 'none' }}>
                    {/* Flag Icon */}
                    <button
                      className="packer-item-flag"
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

                    <div className="packer-item-img-container">
                      <img src="https://placehold.co/100x100/eeeeee/cccccc?text=Product" className="packer-item-img" alt="Product" />
                    </div>

                    <div className="packer-item-details">
                      <div className="packer-item-name">
                        <span className="packer-item-qty">{item.qty}x</span> {item.name}
                      </div>
                      <div className="packer-item-meta">
                        SKU: {item.sku} • QTY: {item.qty}
                      </div>

                      <button
                        className={`packer-item-toggle ${checkedItems[item.sku] ? 'active' : ''}`}
                        onClick={() => setCheckedItems(p => ({ ...p, [item.sku]: !p[item.sku] }))}
                      >
                        <div className="packer-check-circle">
                          {checkedItems[item.sku] && <CheckCircle2 size={10} />}
                        </div>
                        <span>{checkedItems[item.sku] ? 'Verified' : 'Not verified'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Flagging Box */}
                  {flagItemSku === item.sku && (
                    <div style={{ padding: '0 12px 12px 12px' }}>
                      <div className="packer-flag-box">
                        <textarea
                          placeholder="Describe the issue..."
                          className="packer-flag-textarea"
                          value={flagNote}
                          onChange={(e) => setFlagNote(e.target.value)}
                        />
                        <div className="packer-flag-actions">
                          <button className="packer-btn-flag-submit" onClick={handleFlag}>
                            Flag Issue
                          </button>
                          <button className="packer-btn-flag-cancel" onClick={() => { setFlagItemSku(null); setFlagNote(''); }}>
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

          {/* Bag Count Section */}
          <div className="packer-bag-section">
            <div className="packer-bag-label">Total Number of Bags *</div>
            <div className="packer-bag-desc">Record the physical number of bags/boxes for the driver.</div>
            <input 
              type="number" 
              min="1" 
              className="packer-bag-input" 
              placeholder="e.g. 2"
              value={bags}
              onChange={(e) => setBags(e.target.value)}
            />
          </div>
        </div>

        {/* Bottom Sticky Action */}
        <div className="packer-bottom-action">
          <div className="packer-bottom-action-inner">
            <button
              className={`packer-btn-complete ${canComplete ? 'ready' : 'not-ready'}`}
              disabled={!canComplete}
              onClick={() => handleComplete(activeOrder.id)}
            >
              {canComplete ? (
                <>
                  <CheckSquare size={14} />
                  <span>Complete Packing</span>
                </>
              ) : (
                <>
                  <Clock size={14} />
                  <span>{totalCount - checkedCount} item(s) to verify</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main List View ───
  return (
    <div className="packer-container">
      <div className="packer-content">
        {/* Top Metrics */}
        <div className="packer-metrics">
          <div className="packer-metric-card">
            <div className="packer-metric-icon">
              <PackageOpen size={14} />
            </div>
            <div>
              <div className="packer-metric-value">{newOrders.length}</div>
              <div className="packer-metric-label">To Pack</div>
            </div>
          </div>
          <div className="packer-metric-card">
            <div className="packer-metric-icon">
              <Clock size={14} />
            </div>
            <div>
              <div className="packer-metric-value">{myOrders.length}</div>
              <div className="packer-metric-label">My Active</div>
            </div>
          </div>
          <div className="packer-metric-card">
            <div className="packer-metric-icon">
              <CheckSquare size={14} />
            </div>
            <div>
              <div className="packer-metric-value">{completedOrders.length}</div>
              <div className="packer-metric-label">Packed</div>
            </div>
          </div>
          <div className="packer-metric-card">
            <div className="packer-metric-icon">
              <Package size={14} />
            </div>
            <div>
              <div className="packer-metric-value">{allOrders.length}</div>
              <div className="packer-metric-label">Total</div>
            </div>
          </div>
        </div>

        <div className="packer-shift-text">
          Shift: Apr 20 – May 20 (Last 30 Days)
        </div>

        {/* Tabs */}
        <div className="packer-tabs">
          {['New', 'Mine', 'Completed', 'All'].map(tab => (
            <button
              key={tab}
              className={`packer-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="packer-tab-badge">
                {getTabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filters (Completed / All tabs) */}
        {(activeTab === 'Completed' || activeTab === 'All') && (
          <div style={{ marginBottom: '12px' }}>
            <div className="packer-search-container">
              <Search className="packer-search-icon" size={16} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="packer-search-input" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="packer-filters">
              <button 
                className={`packer-filter-btn ${filterDays === 7 ? 'active' : ''}`}
                onClick={() => setFilterDays(7)}
              >
                7 Days
              </button>
              <button 
                className={`packer-filter-btn ${filterDays === 30 ? 'active' : ''}`}
                onClick={() => setFilterDays(30)}
              >
                30 Days
              </button>
              <button className="packer-filter-btn">
                <Calendar size={12} /> Apr 22 - May 22 <ChevronDown size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ─── Order Lists ─── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>Loading...</div>
        ) : (
          <div>

            {/* ── NEW TAB ── */}
            {activeTab === 'New' && newOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>No new orders ready for packing</div>
            )}

            {activeTab === 'New' && newOrders.map(order => {
              const pickedCount = order.items ? order.items.filter(i => i.picked).length : 0
              const totalCount = order.items ? order.items.length : 0
              return (
                <div key={order.id} className="packer-order-card">
                  <div className="packer-order-header">
                    <div className="packer-order-id">{order.id}</div>
                    <div className="packer-order-items-count">{pickedCount}/{totalCount} items</div>
                  </div>
                  <div className="packer-order-customer">{order.customer} • {order.phone}</div>
                  <div className="packer-order-date">{order.date || '5/20/2026 • 08:11 AM'}</div>

                  <div className="packer-order-actions">
                    <button
                      className="packer-btn-assign"
                      onClick={() => { setOrderToAssign(order); setAssignModalOpen(true); }}
                    >
                      <UserPlus size={14} />
                      <span>Assign to Me</span>
                    </button>
                    <button
                      className="packer-btn-view"
                      onClick={() => handleStartPacking(order)}
                    >
                      <Eye size={14} />
                      <span>View Detail</span>
                    </button>
                  </div>
                </div>
              )
            })}


            {/* ── MINE TAB ── */}
            {activeTab === 'Mine' && myOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>You have no active orders</div>
            )}

            {activeTab === 'Mine' && myOrders.map(order => {
              const totalCount = order.items ? order.items.length : 0
              return (
                <div key={order.id} className="packer-order-card">
                  <div className="packer-order-header">
                    <div className="packer-order-id">{order.id}</div>
                    <div className="packer-order-items-count">{totalCount} items</div>
                  </div>
                  <div className="packer-order-customer">{order.customer} • {order.phone}</div>
                  <div className="packer-order-date">{order.date || '5/20/2026 • 08:11 AM'}</div>

                  <div className="packer-order-actions">
                    <button
                      className="packer-btn-start"
                      onClick={() => handleStartPacking(order)}
                    >
                      <PackageOpen size={14} />
                      <span>Start Packing</span>
                    </button>
                    <button
                      className="packer-btn-view"
                      onClick={() => handleStartPacking(order)}
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              )
            })}


            {/* ── COMPLETED TAB ── */}
            {activeTab === 'Completed' && filteredCompleted.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>No completed orders found</div>
            )}

            {activeTab === 'Completed' && filteredCompleted.map(order => {
              const packedCount = order.items ? order.items.filter(i => i.picked).length : 0
              const totalCount = order.items ? order.items.length : 0
              return (
                <div key={order.id} className="packer-order-card">
                  <div className="packer-order-header">
                    <div className="packer-order-id">{order.id}</div>
                    <div className="packer-order-items-count" style={{ fontWeight: 'bold' }}>{packedCount}/{totalCount}</div>
                  </div>
                  <div className="packer-order-customer">{order.customer} • {order.phone}</div>
                  <div className="packer-order-date">{order.date || '5/20/2026 • 08:11 AM'}</div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid black', paddingTop: '8px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', border: '1px solid black', fontSize: '11px', fontWeight: 'bold' }}>
                        <CheckCircle2 size={12} /> {packedCount} Packed
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', border: '1px solid black', fontSize: '11px', fontWeight: 'bold' }}>
                        <Package size={12} /> {order.bags || 1} Bag
                      </div>
                    </div>
                    <button
                      className="packer-btn-view"
                      style={{ fontSize: '11px', padding: '4px 10px', flex: 'none' }}
                      onClick={() => handleStartPacking(order)}
                    >
                      <Eye size={12} />
                      <span>View Detail</span>
                    </button>
                  </div>
                </div>
              )
            })}


            {/* ── ALL TAB ── */}
            {activeTab === 'All' && filteredAll.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>No orders found</div>
            )}

            {activeTab === 'All' && filteredAll.map(order => {
              const pickedCount = order.items ? order.items.filter(i => i.picked).length : 0
              const totalCount = order.items ? order.items.length : 0
              const isNew = order.status === 'packed' && !order.packedBy
              const isMineActive = order.status === 'packing' && order.assignedTo === user.email
              const isOtherActive = order.status === 'packing' && order.assignedTo && order.assignedTo !== user.email
              const isCompleted = ['assigning', 'assigned', 'delivered', 'failed'].includes(order.status)

              return (
                <div key={order.id} className="packer-order-card">
                  <div className="packer-order-header">
                    <div className="packer-order-id">{order.id}</div>
                    <div className="packer-order-items-count" style={isCompleted ? { fontWeight: 'bold' } : {}}>{pickedCount}/{totalCount}</div>
                  </div>
                  <div className="packer-order-customer">{order.customer} • {order.phone}</div>
                  <div className="packer-order-date">{order.date || '5/20/2026 • 08:11 AM'}</div>

                  {/* New: show Assign to Me */}
                  {isNew && (
                    <div className="packer-order-actions">
                      <button
                        className="packer-btn-assign"
                        onClick={() => { setOrderToAssign(order); setAssignModalOpen(true); }}
                      >
                        <UserPlus size={14} />
                        <span>Assign to Me</span>
                      </button>
                      <button
                        className="packer-btn-view"
                        onClick={() => handleStartPacking(order)}
                      >
                        <Eye size={14} />
                        <span>View Detail</span>
                      </button>
                    </div>
                  )}

                  {/* Mine active */}
                  {isMineActive && (
                    <div className="packer-order-actions">
                      <button
                        className="packer-btn-start"
                        onClick={() => handleStartPacking(order)}
                      >
                        <PackageOpen size={14} />
                        <span>Continue Packing</span>
                      </button>
                    </div>
                  )}

                  {/* Other packer active */}
                  {isOtherActive && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid black', paddingTop: '8px', marginTop: '4px' }}>
                      <button
                        className="packer-btn-view"
                        style={{ fontSize: '11px', padding: '4px 10px', flex: 'none' }}
                        onClick={() => handleStartPacking(order)}
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                      <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 'bold' }}>
                        Packer: {order.packerName || order.assignedTo.split('@')[0]}
                      </span>
                    </div>
                  )}

                  {/* Completed */}
                  {isCompleted && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid black', paddingTop: '8px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', border: '1px solid black', fontSize: '11px', fontWeight: 'bold' }}>
                          <CheckCircle2 size={12} /> {pickedCount} Packed
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', border: '1px solid black', fontSize: '11px', fontWeight: 'bold' }}>
                          <Package size={12} /> {order.bags || 1} Bag
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="packer-btn-view"
                          style={{ fontSize: '11px', padding: '4px 10px', flex: 'none' }}
                          onClick={() => handleStartPacking(order)}
                        >
                          <Eye size={12} />
                          <span>View Detail</span>
                        </button>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 'bold' }}>
                          Packer: {order.packerName || (order.packedBy === user.email ? user.name : order.packedBy?.split('@')[0] || '—')}
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
        <div className="packer-modal-overlay">
          <div className="packer-modal-content">
            <h3 className="packer-modal-title">Assign Order to You?</h3>
            <p className="packer-modal-desc">Are you sure you want to assign order <strong>{orderToAssign?.id}</strong> to yourself for packing?</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="packer-btn-confirm"
                onClick={handleConfirmAssign}
              >
                <Check size={14} />
                <span>Yes, Assign Order</span>
              </button>
              <button
                className="packer-btn-cancel"
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
