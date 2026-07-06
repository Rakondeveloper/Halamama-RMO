import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchOrders, assignOrder, completePacking, flagOrderIssue, subscribeToSync } from '../../api/orders'
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
  const [filterType, setFilterType] = useState('30days') // '7days', '30days', 'custom'
  const [customRange, setCustomRange] = useState({ start: '', end: '' })
  const [showDatePicker, setShowDatePicker] = useState(false)

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
    const unsubscribe = subscribeToSync(() => {
      loadOrders()
    })
    return () => unsubscribe()
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

  // Parse any date string format ("5/27/2026 • 09:45 AM", "2026-04-20", etc.) to local midnight
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null
    // Clean string by taking part before "•" if present
    const cleanStr = dateStr.split('•')[0].trim()
    
    // Check if it contains YYYY-MM-DD
    if (cleanStr.includes('-')) {
      const parts = cleanStr.split('-')
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10) - 1
        const d = parseInt(parts[2], 10)
        return new Date(y, m, d)
      }
    }
    
    // Check if it contains M/D/YYYY
    if (cleanStr.includes('/')) {
      const parts = cleanStr.split('/')
      if (parts.length === 3) {
        const m = parseInt(parts[0], 10) - 1
        const d = parseInt(parts[1], 10)
        const y = parseInt(parts[2], 10)
        return new Date(y, m, d)
      }
    }
    
    // Fallback to standard local parsing
    const parsed = new Date(cleanStr)
    if (isNaN(parsed.getTime())) return null
    parsed.setHours(0, 0, 0, 0)
    return parsed
  }

  const formatCustomRangeLabel = () => {
    if (!customRange.start || !customRange.end) return 'Custom Range'
    const startDate = parseLocalDate(customRange.start)
    const endDate = parseLocalDate(customRange.end)
    if (!startDate || !endDate) return 'Custom Range'
    
    const options = { month: 'short', day: 'numeric' }
    const startStr = startDate.toLocaleDateString('en-US', options)
    const endStr = endDate.toLocaleDateString('en-US', options)
    
    return `${startStr} - ${endStr}`
  }

  const matchesDays = (orderDateStr) => {
    const orderDateObj = parseLocalDate(orderDateStr)
    if (!orderDateObj) return false

    // Today midnight local time
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (filterType === '7days') {
      const startLimit = new Date(today)
      startLimit.setDate(today.getDate() - 6) // Last 7 calendar days (e.g. June 13 to June 19)
      return orderDateObj >= startLimit && orderDateObj <= today
    }
    
    if (filterType === '30days') {
      const startLimit = new Date(today)
      startLimit.setDate(today.getDate() - 29) // Last 30 calendar days (e.g. May 21 to June 19)
      return orderDateObj >= startLimit && orderDateObj <= today
    }

    if (filterType === 'custom') {
      if (!customRange.start || !customRange.end) return true
      const startLimit = parseLocalDate(customRange.start)
      const endLimit = parseLocalDate(customRange.end)
      if (!startLimit || !endLimit) return true
      return orderDateObj >= startLimit && orderDateObj <= endLimit
    }

    return true
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

  // 1. Date Filter applied first to all orders
  const dateFilteredOrders = orders.filter(o => matchesDays(o.date))

  // 2. Tab Filter applied:
  // For New and Mine, we use unfiltered orders.
  // For Completed and All, we use date-filtered orders.
  const newOrdersFiltered = newOrders
  const myOrdersFiltered = myOrders
  const completedOrdersFiltered = dateFilteredOrders.filter(o =>
    o.packedBy === user.email &&
    ['assigning', 'assigned', 'delivered', 'failed'].includes(o.status)
  )
  const allOrdersFiltered = dateFilteredOrders

  // 3. Search Filter applied next
  const filterList = (list) => {
    return list.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (o.phone && o.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesSearch
    })
  }

  const filteredNewOrders = filterList(newOrdersFiltered)
  const filteredMyOrders = filterList(myOrdersFiltered)
  const filteredCompletedOrders = filterList(completedOrdersFiltered)
  const filteredAllOrders = filterList(allOrdersFiltered)

  const getTabCount = (tab) => {
    switch (tab) {
      case 'New': return newOrdersFiltered.length
      case 'Mine': return myOrdersFiltered.length
      case 'Completed': return completedOrdersFiltered.length
      case 'All': return allOrdersFiltered.length
      default: return 0
    }
  }

  const getShiftText = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const options = { month: 'short', day: 'numeric' }
    
    if (filterType === '7days') {
      const start = new Date(today)
      start.setDate(today.getDate() - 6)
      return `Shift: ${start.toLocaleDateString('en-US', options)} – ${today.toLocaleDateString('en-US', options)} (Last 7 Days)`
    }
    
    if (filterType === '30days') {
      const start = new Date(today)
      start.setDate(today.getDate() - 29)
      return `Shift: ${start.toLocaleDateString('en-US', options)} – ${today.toLocaleDateString('en-US', options)} (Last 30 Days)`
    }
    
    if (filterType === 'custom') {
      if (!customRange.start || !customRange.end) return 'Shift: Custom Date Range'
      const start = parseLocalDate(customRange.start)
      const end = parseLocalDate(customRange.end)
      if (!start || !end) return 'Shift: Custom Date Range'
      return `Shift: ${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`
    }
    
    return 'Shift: All Days'
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
                      style={{ color: flagItemSku === item.sku ? '#ef4444' : 'var(--color-muted)' }}
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
                      <Flag size={12} fill="currentColor" />
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
              <div className="packer-metric-value">{newOrdersFiltered.length}</div>
              <div className="packer-metric-label">To Pack</div>
            </div>
          </div>
          <div className="packer-metric-card">
            <div className="packer-metric-icon">
              <CheckSquare size={14} />
            </div>
            <div>
              <div className="packer-metric-value">{completedOrdersFiltered.length}</div>
              <div className="packer-metric-label">Packed</div>
            </div>
          </div>
        </div>

        <div className="packer-shift-text">
          {getShiftText()}
        </div>

        {/* Search Bar */}
        <div className="packer-search-container" style={{ marginBottom: '12px' }}>
          <Search className="packer-search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search orders, customer name, or phone..." 
            className="packer-search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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

        {/* Filters (Completed / All tabs) */}
        {(activeTab === 'Completed' || activeTab === 'All') && (
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <div className="packer-filters" style={{ overflow: 'visible' }}>
              <button 
                className={`packer-filter-btn ${filterType === '7days' ? 'active' : ''}`}
                onClick={() => {
                  setFilterType('7days')
                  setShowDatePicker(false)
                }}
              >
                7 Days
              </button>
              <button 
                className={`packer-filter-btn ${filterType === '30days' ? 'active' : ''}`}
                onClick={() => {
                  setFilterType('30days')
                  setShowDatePicker(false)
                }}
              >
                30 Days
              </button>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button 
                  className={`packer-filter-btn ${filterType === 'custom' ? 'active' : ''}`}
                  onClick={() => {
                    setFilterType('custom')
                    setShowDatePicker(!showDatePicker)
                  }}
                >
                  <Calendar size={12} /> {formatCustomRangeLabel()} <ChevronDown size={12} />
                </button>
                {showDatePicker && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: 'var(--color-bg)',
                    border: '2px solid var(--color-border)',
                    padding: '12px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '220px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <label style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-muted)' }}>Start Date</label>
                      <input 
                        type="date" 
                        value={customRange.start}
                        onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                        style={{
                          padding: '4px',
                          fontSize: '11px',
                          border: '1.5px solid var(--color-border)',
                          fontFamily: 'var(--font-picker)',
                          width: '100%',
                          color: 'black'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <label style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-muted)' }}>End Date</label>
                      <input 
                        type="date" 
                        value={customRange.end}
                        onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                        style={{
                          padding: '4px',
                          fontSize: '11px',
                          border: '1.5px solid var(--color-border)',
                          fontFamily: 'var(--font-picker)',
                          width: '100%',
                          color: 'black'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <button 
                        className="packer-filter-btn"
                        onClick={() => setShowDatePicker(false)}
                        style={{ flex: 1, fontSize: '10px', padding: '4px', width: '100%' }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Order Lists ─── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>Loading...</div>
        ) : (
          <div>

            {/* ── NEW TAB ── */}
            {activeTab === 'New' && filteredNewOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>No new orders ready for packing</div>
            )}

            {activeTab === 'New' && filteredNewOrders.map(order => {
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
            {activeTab === 'Mine' && filteredMyOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>You have no active orders</div>
            )}

            {activeTab === 'Mine' && filteredMyOrders.map(order => {
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
            {activeTab === 'Completed' && filteredCompletedOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>No completed orders found</div>
            )}

            {activeTab === 'Completed' && filteredCompletedOrders.map(order => {
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
            {activeTab === 'All' && filteredAllOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>No orders found</div>
            )}

            {activeTab === 'All' && filteredAllOrders.map(order => {
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
