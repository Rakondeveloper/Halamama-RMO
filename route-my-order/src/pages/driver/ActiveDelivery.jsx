import React from 'react'
import { ArrowLeft, CheckCircle2, Package, RotateCcw, Check, MapPin, User, Phone, Navigation, XCircle } from 'lucide-react'
import { DeliveryCountdown, formatAssignedTime, formatPhone } from './DriverOrderCard'

export function ActiveDelivery({
  activeOrder,
  setActiveOrder,
  user,
  step,
  setStep,
  setVerifyingOrder,
  setVerifyModalOpen,
  setVerificationError,
  handleStartDelivery,
  setCollectedAmount,
  setPaymentModalOpen,
  setFailureModalOpen,
  setReturnCollectItem,
  setReturnDriverNote,
  setReturnCollectModalOpen,
  handleOpenMaps,
  handleCall,
}) {
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="driver-order-id" style={{ fontSize: '18px', fontWeight: '800' }}>{activeOrder.id}</span>
              {activeOrder.bagVerificationStatus === 'verified' && (
                <span className="driver-status-pill verified">
                  ✓ VERIFIED
                </span>
              )}
              <span className={`driver-status-pill ${activeOrder.status === 'assigned' ? 'accepted' : (activeOrder.status === 'started' ? 'started' : activeOrder.status)}`}>
                {activeOrder.status === 'assigned' ? 'accepted' : (activeOrder.status === 'started' ? 'started' : activeOrder.status)}
              </span>
              {activeOrder.returnItems && activeOrder.returnItems.length > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  background: '#fef7cd', color: '#b45309', border: '1px solid #fde68a',
                  padding: '2px 8px', fontSize: '10px', fontWeight: '700',
                  borderRadius: '10px'
                }}>
                  Collect ({activeOrder.returnItems.filter(r => r.status === 'pending').length})
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {(step > 1 || activeOrder.bagVerificationStatus === 'verified') && step !== 4 && (
                <span className="driver-status-pill verified"><CheckCircle2 size={12}/> Verified</span>
              )}
            </div>
          </div>
          <div className="driver-summary-date" style={{ marginBottom: step === 1 ? '16px' : '0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>{activeOrder.date}</span>
            <DeliveryCountdown dateStr={activeOrder.date} orderStatus={activeOrder.status} />
          </div>
          
          {step === 1 && (
            <button 
              className="driver-btn-complete primary" 
              style={{ 
                marginTop: '12px', 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                fontWeight: '800',
                fontSize: '14px',
                padding: '12px'
              }} 
              onClick={() => {
                setVerifyingOrder(activeOrder)
                setVerifyModalOpen(true)
                setVerificationError('')
              }}
            >
              <Package size={16} /> Verify Bags
            </button>
          )}
        </div>

        {/* Order Items */}
        <div className="driver-summary-card">
          <div className="driver-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '12px' }}>
              <Package size={14}/> Order Items
            </div>
            <div className="driver-badge">{activeOrder.bags} Bags | {activeOrder.items?.reduce((a, b) => a + b.qty, 0) || 0} Items</div>
          </div>
          <div className="driver-items-list">
            {activeOrder.items?.map((item, idx) => (
              <div key={idx} className="driver-item-row">
                <div className="driver-item-image">
                  <Package size={18} color="var(--color-muted)"/>
                </div>
                <div className="driver-item-details">
                  <div className="driver-item-name">{item.name}</div>
                  <div className="driver-item-meta">
                    <span className="driver-item-qty">Qty: {item.qty}</span>
                    <span>•</span>
                    <span className="driver-item-sku">SKU: {item.sku}</span>
                  </div>
                  {item.fcName && (
                    <div style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: '700', marginTop: '3px' }}>
                      Loc: {item.fcName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Returns / Collections Section */}
        {activeOrder.returnItems && activeOrder.returnItems.length > 0 && (
          <div className="driver-summary-card">
            <div className="driver-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '12px' }}>
                <RotateCcw size={14}/> Returns / Collections
              </div>
              <div className="driver-badge">{activeOrder.returnItems.length}</div>
            </div>
            
            {/* Return items table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '6px', padding: '8px 12px', borderBottom: '1.5px solid var(--color-border)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              <span>Item</span>
              <span>Type</span>
              <span style={{ textAlign: 'center' }}>Qty</span>
              <span style={{ textAlign: 'right' }}>Status</span>
            </div>
            
            {/* Return items */}
            {activeOrder.returnItems.map((ret, idx) => (
              <div key={ret.id || idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '6px', padding: '10px 12px', borderBottom: idx < activeOrder.returnItems.length - 1 ? '1px solid var(--color-light-gray)' : 'none', alignItems: 'center', fontSize: '11px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '11px', lineHeight: '1.3' }}>{ret.itemName}</div>
                  {ret.sku && <div style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>{ret.sku}</div>}
                </div>
                <span style={{ padding: '1px 6px', background: 'var(--color-light-gray)', fontWeight: '600', fontSize: '9px', textTransform: 'uppercase' }}>{ret.type}</span>
                <span style={{ textAlign: 'center', fontWeight: '700' }}>{ret.qty}</span>
                <div style={{ textAlign: 'right' }}>
                  {ret.status === 'pending' ? (
                    <button
                      onClick={() => {
                        setReturnCollectItem(ret)
                        setReturnDriverNote('')
                        setReturnCollectModalOpen(true)
                      }}
                      style={{
                        background: 'black', color: 'white', border: 'none',
                        padding: '4px 10px', fontSize: '10px', fontWeight: '700',
                        cursor: 'pointer', textTransform: 'uppercase'
                      }}
                    >
                      Collect
                    </button>
                  ) : ret.status === 'picked up' ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                      padding: '2px 8px', fontSize: '9px', fontWeight: '700',
                      borderRadius: '10px'
                    }}>
                      <CheckCircle2 size={10} /> Collected
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                      padding: '2px 8px', fontSize: '9px', fontWeight: '700',
                      borderRadius: '10px'
                    }}>
                      <Check size={10} /> Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {/* All collected banner */}
            {activeOrder.returnItems.every(r => r.status !== 'pending') && (
              <div style={{
                padding: '10px 12px', background: '#f0fdf4', borderTop: '1px solid #bbf7d0',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '11px', fontWeight: '600', color: '#16a34a'
              }}>
                <CheckCircle2 size={14} /> All items collected. Return verified.
              </div>
            )}
          </div>
        )}

        {/* Pickup Locations Summary */}
        <div className="driver-summary-card">
          <div className="driver-card-title">Pickup Locations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from(new Set(activeOrder.items?.map(i => i.fcName || 'Main Warehouse'))).map((locName, idx) => {
              const matchingItem = activeOrder.items?.find(i => i.fcName === locName);
              const isVL = matchingItem?.itemType === 'VL_HMA';
              
              let details = null;
              if (isVL && matchingItem.locationId) {
                try {
                  const raw = localStorage.getItem('hm_vendor_locations');
                  if (raw) {
                    const locs = JSON.parse(raw);
                    const loc = locs.find(l => l.locationId === matchingItem.locationId || (matchingItem.locationId === 'loc-1' && l.locationId === 'loc-001'));
                    if (loc) {
                      details = (
                        <div style={{ color: 'var(--color-muted)', fontSize: '11px', marginTop: '2px', lineHeight: '1.4' }}>
                          <div><strong>Address:</strong> {loc.address}</div>
                          <div><strong>Contact:</strong> {loc.contactPerson} ({loc.phone})</div>
                        </div>
                      );
                    }
                  }
                } catch (e) {}
              }
              
              return (
                <div key={idx} style={{ fontSize: '12px', borderBottom: idx < Array.from(new Set(activeOrder.items?.map(i => i.fcName))).length - 1 ? '1px solid var(--color-light-gray)' : 'none', paddingBottom: '6px' }}>
                  <div style={{ fontWeight: '700', color: 'var(--color-fg)' }}>{locName}</div>
                  {details}
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer */}
        <div className="driver-summary-card">
           <div className="driver-card-title">Customer</div>
           <div className="driver-customer-name" style={{ marginBottom: '10px', fontSize: '13px', fontWeight: '700', color: 'var(--color-fg)' }}>{activeOrder.customer}</div>
           
           <div className="driver-info-label">Contact information</div>
           <div className="driver-info-value" style={{ marginBottom: '10px', color: 'var(--color-fg)', fontSize: '12px' }}>{activeOrder.phone}</div>
           
           <div className="driver-info-label">Shipping address</div>
           <div className="driver-info-value" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--color-fg)', marginBottom: '10px' }}>
              <div style={{ flex: 1, lineHeight: '1.3', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px' }}><User size={12} color="var(--color-muted)"/></div>
                  <strong>{activeOrder.customer}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px', marginTop: '2px' }}><MapPin size={12} color="var(--color-muted)"/></div>
                  <div>
                    {activeOrder.address}
                    {(activeOrder.lat !== undefined && activeOrder.lat !== null && activeOrder.lng !== undefined && activeOrder.lng !== null) ? (
                      <div style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>
                        Lat: {activeOrder.lat} Lng: {activeOrder.lng}
                      </div>
                    ) : (activeOrder.latitude && activeOrder.longitude) ? (
                      <div style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>
                        Lat: {activeOrder.latitude} Lng: {activeOrder.longitude}
                      </div>
                    ) : (
                      <div style={{ fontSize: '9px', color: 'var(--color-muted)', marginTop: '2px' }}>
                        No Coordinates Available
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px' }}><Phone size={12} color="var(--color-muted)"/></div>
                   <span>{activeOrder.phone}</span>
                </div>
              </div>
           </div>

           <div style={{ display: 'flex', gap: '6px' }}>
             <button className="driver-btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px', textTransform: 'none', fontWeight: '600', fontSize: '11px' }} onClick={handleOpenMaps}>
               <MapPin size={12} /> Open In Maps
             </button>
             <button className="driver-btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px', background: 'var(--color-light-gray)', textTransform: 'none', fontWeight: '600', fontSize: '11px' }} onClick={handleCall}>
               <Phone size={12} /> Call
             </button>
           </div>
        </div>

        {/* Notes */}
        <div className="driver-summary-card">
          <div className="driver-card-title">Notes</div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
            {activeOrder.notes || 'Fast delivery'}
          </div>
        </div>

        {/* Billing Details */}
        <div className="driver-summary-card">
          <div style={{ marginBottom: '10px' }}>
             <span className="driver-status-pill verified" style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', padding: '1px 6px', fontSize: '9px' }}>
               <Check size={10} /> Paid
             </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
             <span style={{ color: 'var(--color-fg)' }}>Subtotal <span style={{ color: 'var(--color-muted)', marginLeft: '6px' }}>{activeOrder.items?.reduce((a,b)=>a+b.qty, 0) || 0} items</span></span>
             <span style={{ fontWeight: '600' }}>QAR {activeOrder.total}.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
             <span style={{ color: 'var(--color-fg)' }}>Discount</span>
             <span style={{ fontWeight: '600', color: 'var(--color-muted)' }}>-QAR 0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', borderBottom: '1.5px solid var(--color-light-gray)', paddingBottom: '8px' }}>
             <span style={{ color: 'var(--color-fg)' }}>Shipping <span style={{ color: 'var(--color-muted)', marginLeft: '6px' }}>Standard Delivery</span></span>
             <span style={{ fontWeight: '600' }}>QAR 0</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
             <span style={{ color: 'var(--color-fg)' }}>Total</span>
             <span style={{ fontWeight: '800' }}>QAR {activeOrder.total}.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
             <span style={{ color: 'var(--color-fg)' }}>Paid</span>
             <span style={{ fontWeight: '600' }}>QAR {activeOrder.total}.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
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
               <button className="driver-btn-exception" onClick={() => setFailureModalOpen(true)}>
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
    </div>
  )
}
