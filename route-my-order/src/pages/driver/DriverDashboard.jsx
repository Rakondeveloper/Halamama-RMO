import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchOrders, startDelivery, markDelivered, markFailed, markReturnCollected, subscribeToSync, verifyOrderBags } from '../../api/orders'
import {
  Package,
  ArrowLeft,
  CheckCircle2,
  Search,
  RefreshCcw,
  Clock,
  X
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import './driver.css'
import { DriverOrderCard, formatAssignedTime, formatPhone } from './DriverOrderCard'
import { DriverModals } from './DriverModals'
import { ActiveDelivery } from './ActiveDelivery'

export function DriverDashboard() {
  const { user } = useAuth()
  const { success, error } = useToast()
  
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeOrder, setActiveOrder] = useState(null)
  const [allOrdersModalOpen, setAllOrdersModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Accepted')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortZone, setSortZone] = useState('')
  
  // Execution Steps State (1: Verify, 2: Navigate, 3: Deliver)
  const [step, setStep] = useState(1)
  
  // Dialog Modals State
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

  // Sync active order data if it changes in the main list (e.g. from background sync)
  useEffect(() => {
    if (activeOrder) {
      const current = orders.find(o => o.id === activeOrder.id)
      if (current) {
        setActiveOrder(current)
      }
    }
  }, [orders])

  const handleStartRun = (order) => {
    setActiveOrder(order)
    if (order.status === 'delivered' || order.status === 'failed') {
      setStep(4) // Read-only completed state
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
      <>
        <ActiveDelivery
          activeOrder={activeOrder}
          setActiveOrder={setActiveOrder}
          user={user}
          step={step}
          setStep={setStep}
          setVerifyingOrder={setVerifyingOrder}
          setVerifyModalOpen={setVerifyModalOpen}
          setVerificationError={setVerificationError}
          handleStartDelivery={handleStartDelivery}
          setCollectedAmount={setCollectedAmount}
          setPaymentModalOpen={setPaymentModalOpen}
          setFailureModalOpen={setFailureModalOpen}
          setReturnCollectItem={setReturnCollectItem}
          setReturnDriverNote={setReturnDriverNote}
          setReturnCollectModalOpen={setReturnCollectModalOpen}
          handleOpenMaps={handleOpenMaps}
          handleCall={handleCall}
        />
        
        <DriverModals
          user={user}
          success={success}
          error={error}
          loadOrders={loadOrders}
          verifyModalOpen={verifyModalOpen}
          setVerifyModalOpen={setVerifyModalOpen}
          verifyingOrder={verifyingOrder}
          setVerifyingOrder={setVerifyingOrder}
          verificationError={verificationError}
          setVerificationError={setVerificationError}
          verifying={verifying}
          handleVerifyBags={handleVerifyBags}
          paymentModalOpen={paymentModalOpen}
          setPaymentModalOpen={setPaymentModalOpen}
          collectedAmount={collectedAmount}
          setCollectedAmount={setCollectedAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handleSuccess={handleSuccess}
          activeOrder={activeOrder}
          setActiveOrder={setActiveOrder}
          failureModalOpen={failureModalOpen}
          setFailureModalOpen={setFailureModalOpen}
          failureReason={failureReason}
          setFailureReason={setFailureReason}
          handleFail={handleFail}
          returnCollectModalOpen={returnCollectModalOpen}
          setReturnCollectModalOpen={setReturnCollectModalOpen}
          returnCollectItem={returnCollectItem}
          setReturnCollectItem={setReturnCollectItem}
          returnDriverNote={returnDriverNote}
          setReturnDriverNote={setReturnDriverNote}
          returnCollecting={returnCollecting}
          setReturnCollecting={setReturnCollecting}
          markReturnCollected={markReturnCollected}
        />
      </>
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
            <Package size={20} color="var(--color-muted)" />
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
              <DriverOrderCard
                key={order.id}
                order={order}
                handleStartRun={handleStartRun}
                setVerifyingOrder={setVerifyingOrder}
                setVerifyModalOpen={setVerifyModalOpen}
                setVerificationError={setVerificationError}
              />
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
                <DriverOrderCard
                  key={order.id}
                  order={order}
                  handleStartRun={handleStartRun}
                  setVerifyingOrder={setVerifyingOrder}
                  setVerifyModalOpen={setVerifyModalOpen}
                  setVerificationError={setVerificationError}
                  setAllOrdersModalOpen={setAllOrdersModalOpen}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactional Dialog Overlays */}
      <DriverModals
        user={user}
        success={success}
        error={error}
        loadOrders={loadOrders}
        verifyModalOpen={verifyModalOpen}
        setVerifyModalOpen={setVerifyModalOpen}
        verifyingOrder={verifyingOrder}
        setVerifyingOrder={setVerifyingOrder}
        verificationError={verificationError}
        setVerificationError={setVerificationError}
        verifying={verifying}
        handleVerifyBags={handleVerifyBags}
        paymentModalOpen={paymentModalOpen}
        setPaymentModalOpen={setPaymentModalOpen}
        collectedAmount={collectedAmount}
        setCollectedAmount={setCollectedAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        handleSuccess={handleSuccess}
        activeOrder={activeOrder}
        setActiveOrder={setActiveOrder}
        failureModalOpen={failureModalOpen}
        setFailureModalOpen={setFailureModalOpen}
        failureReason={failureReason}
        setFailureReason={setFailureReason}
        handleFail={handleFail}
        returnCollectModalOpen={returnCollectModalOpen}
        setReturnCollectModalOpen={setReturnCollectModalOpen}
        returnCollectItem={returnCollectItem}
        setReturnCollectItem={setReturnCollectItem}
        returnDriverNote={returnDriverNote}
        setReturnDriverNote={setReturnDriverNote}
        returnCollecting={returnCollecting}
        setReturnCollecting={setReturnCollecting}
        markReturnCollected={markReturnCollected}
      />
    </div>
  )
}
