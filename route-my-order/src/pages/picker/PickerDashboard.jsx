import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchOrders, assignOrder, assignItemToMe, updateItemPickStatus, completePicking, flagOrderIssue, subscribeToSync } from '../../api/orders'
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
  X,
  Briefcase,
  List
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
  const [filterType, setFilterType] = useState('30days') // '7days' | '30days' | 'custom'
  const [customRange, setCustomRange] = useState({ start: '2026-04-20', end: '2026-05-20' })
  const [showDatePicker, setShowDatePicker] = useState(false)

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
    const unsubscribe = subscribeToSync(() => {
      loadOrders()
    })
    return () => unsubscribe()
  }, [])

  const handleConfirmAssign = async () => {
    if (!orderToAssign) return
    try {
      await assignOrder(orderToAssign.id, user.email, 'picker', user.name)
      success('Items assigned to you')
      loadOrders()
      setActiveTab('Mine')
    } catch (err) {
      error('Failed to assign order')
    } finally {
      setAssignModalOpen(false)
      setOrderToAssign(null)
    }
  }

  const handleAssignItemToMe = async (orderId, sku) => {
    try {
      await assignItemToMe(orderId, sku, user.email, user.name)
      success('Item assigned to you')
      loadOrders()
      if (activeOrder) {
        setActiveOrder({
          ...activeOrder,
          items: activeOrder.items.map(i => i.sku === sku ? { ...i, assignedTo: user.email, assignedName: user.name } : i)
        })
      }
    } catch (err) {
      error('Failed to assign item')
    }
  }

  const toggleItemPick = async (orderId, sku, picked) => {
    try {
      await updateItemPickStatus(orderId, sku, picked, user.email, user.name)
      if (activeOrder) {
        setActiveOrder({
          ...activeOrder,
          items: activeOrder.items.map(i => i.sku === sku ? { ...i, picked, assignedTo: user.email, assignedName: user.name } : i)
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
  const newOrders = orders.filter(o => o.status === 'new' || (o.status === 'picking' && o.items && o.items.some(i => !i.assignedTo)))
  const myOrders = orders.filter(o => 
    o.status === 'picking' && (
      o.assignedTo === user.email || 
      (o.items && o.items.some(i => i.assignedTo === user.email))
    )
  )
  const completedOrders = orders.filter(o => 
    (o.status === 'packed' || o.status === 'assigning' || o.status === 'assigned' || o.status === 'delivered') && 
    (o.pickedBy === user.email || (o.items && o.items.some(i => i.assignedTo === user.email)))
  )
  const allOrders = orders

  // 1. Date Filter applied first to all orders
  const dateFilteredOrders = orders.filter(o => matchesDays(o.date))

  // 2. Tab Filter applied:
  // For New and Mine, we use unfiltered orders so old unfulfilled orders are not hidden.
  // For Completed and All, we use date-filtered orders.
  const newOrdersFiltered = newOrders
  const myOrdersFiltered = myOrders
  const completedOrdersFiltered = dateFilteredOrders.filter(o => 
    (o.status === 'packed' || o.status === 'assigning' || o.status === 'assigned' || o.status === 'delivered') && 
    (o.pickedBy === user.email || (o.items && o.items.some(i => i.assignedTo === user.email)))
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
      return `Shift: ${formatCustomRangeLabel()} (Custom Range)`
    }
    return 'Shift'
  }

  if (activeOrder) {
    const pickedCount = activeOrder.items.filter(i => i.picked).length
    const totalCount = activeOrder.items.length
    const myAssignedItems = activeOrder.items.filter(i => i.assignedTo === user.email)
    const myPickedCount = myAssignedItems.filter(i => i.picked).length
    const myTotalCount = myAssignedItems.length
    const allPicked = totalCount > 0 && pickedCount === totalCount
    const canComplete = allPicked || (myTotalCount > 0 && myPickedCount === myTotalCount)
    const progress = totalCount > 0 ? (pickedCount / totalCount) * 100 : 0

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
          {/* Approval Warning Banner */}
          {activeOrder.isApprovedForPicking === false && (
            <div className="picker-warning-banner" style={{ background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e', marginBottom: '12px' }}>
              <AlertTriangle className="picker-warning-icon" size={16} style={{ color: '#d97706' }} />
              <div>
                <div className="picker-warning-title" style={{ color: '#92400e' }}>Awaiting Operations Admin Approval</div>
                <div className="picker-warning-text" style={{ color: '#b45309' }}>This order must be approved by Operations Admin before items can be picked.</div>
              </div>
            </div>
          )}

          {/* Warning Banner */}
          <div className="picker-warning-banner">
            <AlertTriangle className="picker-warning-icon" size={16} />
            <div>
              <div className="picker-warning-title">Order Updated in Shopify</div>
              <div className="picker-warning-text">New items were added to this order. Please pick or flag them to continue.</div>
            </div>
          </div>

          {/* Customer & Progress Card matching Screenshot 3 */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>#{activeOrder.id}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{activeOrder.date || 'Aug 3 | 12:02'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                <List size={16} style={{ color: '#1b3636' }} />
                <span>Picking Progress</span>
              </div>
              <span style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '700', fontSize: '12px', padding: '3px 10px', borderRadius: '20px' }}>
                {pickedCount}/{totalCount} items ({Math.round(progress)}%)
              </span>
            </div>
            <div className="picker-progress-bar" style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
              <div className="picker-progress-fill" style={{ width: `${progress}%`, backgroundColor: '#1b3636', borderRadius: '4px', height: '100%' }} />
            </div>

            {/* Top Action Bar matching Screenshot 3 */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button
                className="picker-btn-assign"
                style={{ flex: 1.2, minWidth: '140px', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={handleConfirmAssign}
              >
                <Package size={14} />
                <span>Assign All Items To Me</span>
              </button>
              <button
                className="picker-btn-view"
                style={{ flex: 0.9, minWidth: '95px', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => setFlagItemSku(activeOrder.items[0]?.sku || null)}
              >
                <Flag size={14} />
                <span>Flag Issue</span>
              </button>
              <button
                className="picker-btn-complete ready"
                style={{ flex: 0.9, minWidth: '95px', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', backgroundColor: '#1b3636', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => handleComplete(activeOrder.id)}
              >
                <CheckCircle2 size={14} />
                <span>Complete</span>
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="picker-items-container">
            <div className="picker-items-header">
              Items ({totalCount})
            </div>

            <div>
              {activeOrder.items.map(item => {
                const isAssignedToMe = item.assignedTo === user.email
                const isAssignedToOther = item.assignedTo && item.assignedTo !== user.email
                const isUnassigned = !item.assignedTo

                return (
                <div key={item.sku} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1.5px solid var(--color-border)' }}>
                  <div className="picker-item-row" style={{ borderBottom: 'none' }}>
                    {/* Flag Icon */}
                    <button
                      className="picker-item-flag"
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

                    <div className="picker-item-img-container">
                      <img src="https://placehold.co/100x100/eeeeee/cccccc?text=Product" className="picker-item-img" alt="Product" />
                    </div>

                    <div className="picker-item-details">
                      <div className="picker-item-name">
                        <span className="picker-item-qty">{item.qty}x</span> {item.name}
                        <span className="picker-item-picked-status">({item.picked ? '1/1' : '0/1'})</span>
                      </div>
                      <div className="picker-item-meta" style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        BARCODE: {item.barcode || item.sku || '49549'} <br />
                        SKU: {item.sku}
                      </div>

                      {/* Quantity Badge */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '6px' }}>
                        <span className="picker-badge-qty">QTY {item.qty || 1}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '8px' }}>
                        {item.isApproved === false ? (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#b45309',
                            padding: '4px 8px',
                            border: '1.5px solid #f59e0b',
                            backgroundColor: '#fef3c7',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            Awaiting Ops Admin Approval
                          </span>
                        ) : isUnassigned ? (
                          <button
                            className="picker-btn-assign"
                            style={{ fontSize: '11px', padding: '6px 12px', flex: 'none' }}
                            onClick={() => handleAssignItemToMe(activeOrder.id, item.sku)}
                          >
                            <UserPlus size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Assign to Me
                          </button>
                        ) : null}

                        {isAssignedToMe && (
                          <button
                            className={`picker-item-toggle ${item.picked ? 'active' : ''}`}
                            onClick={() => toggleItemPick(activeOrder.id, item.sku, !item.picked)}
                          >
                            <div className="picker-check-circle">
                              {item.picked && <CheckCircle2 size={10} />}
                            </div>
                            <span>{item.picked ? 'Picked' : 'Not picked'}</span>
                          </button>
                        )}

                        {isAssignedToOther && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: 'var(--color-muted)',
                            padding: '4px 8px',
                            border: '1.5px solid var(--color-border)',
                            backgroundColor: 'var(--color-light-gray)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            Picker: {item.assignedName || item.assignedTo.split('@')[0]}
                            {item.picked && <CheckCircle2 size={12} style={{ color: 'black' }} />}
                          </span>
                        )}
                      </div>
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
              )})}
            </div>
          </div>
        </div>

        {/* Bottom Sticky Action inside the fixed overlay to remain visible & clickable */}
        <div className="picker-bottom-action">
          <div className="picker-bottom-action-inner">
            <button
              className={`picker-btn-complete ${canComplete ? 'ready' : 'not-ready'}`}
              disabled={!canComplete}
              onClick={() => handleComplete(activeOrder.id)}
            >
              {canComplete ? (
                <>
                  <CheckSquare size={14} />
                  <span>Complete Picking</span>
                </>
              ) : (
                <>
                  <Clock size={14} />
                  <span>{myTotalCount > 0 ? (myTotalCount - myPickedCount) : (totalCount - pickedCount)} item(s) remaining</span>
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
              <div className="picker-metric-value">{newOrdersFiltered.length}</div>
              <div className="picker-metric-label">New Orders</div>
            </div>
          </div>
          <div className="picker-metric-card">
            <div className="picker-metric-icon">
              <CheckSquare size={14} />
            </div>
            <div>
              <div className="picker-metric-value">{completedOrdersFiltered.length}</div>
              <div className="picker-metric-label">Total Served</div>
            </div>
          </div>

        </div>

        <div className="picker-shift-text">
          {getShiftText()}
        </div>

        {/* Search Bar */}
        <div className="picker-search-container" style={{ marginBottom: '12px' }}>
          <Search className="picker-search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search orders, customer name, or phone..." 
            className="picker-search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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

        {/* Filters (Shown on Completed/All) */}
        {(activeTab === 'Completed' || activeTab === 'All') && (
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <div className="picker-filters" style={{ overflow: 'visible' }}>
              <button 
                className={`picker-filter-btn ${filterType === '7days' ? 'active' : ''}`}
                onClick={() => {
                  setFilterType('7days')
                  setShowDatePicker(false)
                }}
              >
                7 Days
              </button>
              <button 
                className={`picker-filter-btn ${filterType === '30days' ? 'active' : ''}`}
                onClick={() => {
                  setFilterType('30days')
                  setShowDatePicker(false)
                }}
              >
                30 Days
              </button>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button 
                  className={`picker-filter-btn ${filterType === 'custom' ? 'active' : ''}`}
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
                        className="picker-filter-btn"
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

        {/* List of Orders */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {activeTab === 'New' && filteredNewOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>
                {searchTerm ? 'No matches found' : 'No new orders'}
              </div>
            )}

            {activeTab === 'New' && filteredNewOrders.map(order => {
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

            {activeTab === 'Mine' && filteredMyOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>
                {searchTerm ? 'No matches found' : 'You have no active orders'}
              </div>
            )}

            {activeTab === 'Mine' && filteredMyOrders.map(order => {
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
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>
                {searchTerm ? 'No matches found' : 'No completed orders found'}
              </div>
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
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '12px' }}>
                {searchTerm ? 'No matches found' : 'No orders found'}
              </div>
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

      {/* Assign Bottom Sheet Modal matching Screenshot 2 */}
      {assignModalOpen && (
        <div className="picker-modal-sheet-overlay" onClick={() => setAssignModalOpen(false)}>
          <div className="picker-modal-sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="picker-sheet-handle" />
            <h3 className="picker-sheet-title">Assign Order #{orderToAssign?.id}</h3>
            <p className="picker-sheet-desc">Choose how you would like to assign this order:</p>

            <button className="picker-option-card" onClick={handleConfirmAssign}>
              <div className="picker-option-icon">
                <Briefcase size={20} />
              </div>
              <div>
                <div className="picker-option-title">Assign Complete Order</div>
                <div className="picker-option-sub">Assign all items in this order to yourself now.</div>
              </div>
            </button>

            <button
              className="picker-option-card"
              onClick={() => {
                setActiveOrder(orderToAssign);
                setAssignModalOpen(false);
              }}
            >
              <div className="picker-option-icon">
                <List size={20} />
              </div>
              <div>
                <div className="picker-option-title">Assign Item-wise</div>
                <div className="picker-option-sub">Open order details to assign specific items individually.</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
