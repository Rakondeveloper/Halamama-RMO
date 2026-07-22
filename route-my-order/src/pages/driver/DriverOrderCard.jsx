import { useState, useEffect } from 'react'
import { Calendar, Clock, RotateCcw, Package } from 'lucide-react'

export const formatAssignedTime = (dateStr) => {
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

export const formatPhone = (phoneStr) => {
  if (!phoneStr) return '—';
  if (phoneStr.startsWith('+')) return phoneStr;
  return `+974 ${phoneStr}`;
};

export function DeliveryCountdown({ dateStr, orderStatus }) {
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

export function DriverOrderCard({
  order,
  handleStartRun,
  setVerifyingOrder,
  setVerifyModalOpen,
  setVerificationError,
  setAllOrdersModalOpen,
}) {
  return (
    <div className="driver-order-card">
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
        <div className="driver-order-time-row">
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
            <span className="driver-return-count-badge">
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
                  if (setAllOrdersModalOpen) {
                    setAllOrdersModalOpen(false)
                  }
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
  )
}
