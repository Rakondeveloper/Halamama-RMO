import React from 'react'
import { X, Package, RotateCcw, Check, CreditCard, Banknote, Link, AlertCircle, Info } from 'lucide-react'

export function DriverModals({
  user,
  success,
  error,
  loadOrders,
  
  // Verification Modal props
  verifyModalOpen,
  setVerifyModalOpen,
  verifyingOrder,
  setVerifyingOrder,
  verificationError,
  setVerificationError,
  verifying,
  handleVerifyBags,

  // Payment Modal props
  paymentModalOpen,
  setPaymentModalOpen,
  collectedAmount,
  setCollectedAmount,
  paymentMethod,
  setPaymentMethod,
  handleSuccess,
  activeOrder,
  setActiveOrder,

  // Failure Modal props
  failureModalOpen,
  setFailureModalOpen,
  failureReason,
  setFailureReason,
  handleFail,

  // Return Collect Modal props
  returnCollectModalOpen,
  setReturnCollectModalOpen,
  returnCollectItem,
  setReturnCollectItem,
  returnDriverNote,
  setReturnDriverNote,
  returnCollecting,
  setReturnCollecting,
  markReturnCollected,
}) {
  return (
    <>
      {/* Verification Modal */}
      {verifyModalOpen && verifyingOrder && (
        <div className="driver-modal-overlay">
          <div className="driver-modal-content" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="driver-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, textTransform: 'none' }}>
                <Package size={18}/> Bag Verification
              </h3>
              <button 
                onClick={() => {
                  setVerifyModalOpen(false)
                  setVerifyingOrder(null)
                  setVerificationError('')
                }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg)' }}
              >
                <X size={18}/>
              </button>
            </div>
            <p className="driver-modal-desc" style={{ textAlign: 'left', marginBottom: '20px' }}>Confirm that physical counts match the values below before starting delivery.</p>
            
            {verificationError && (
              <div className="driver-warning-box" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{verificationError}</span>
              </div>
            )}

            <div className="driver-verification-metrics">
              <div className="metric-box">
                <div className="label">EXPECTED BAGS</div>
                <div className="value">{verifyingOrder.bags}</div>
              </div>
              <div className="metric-box">
                <div className="label">TOTAL ITEMS</div>
                <div className="value">{verifyingOrder.items?.reduce((acc, i) => acc + i.qty, 0) || 0}</div>
              </div>
            </div>

            <div className="driver-info-box">
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Scan or count the physical bags provided to ensure they match the number displayed above.</span>
            </div>
            <div className="driver-warning-box">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Verifying ensures you are accountable only for the items you have physically received.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
              <button 
                className="driver-btn-cancel" 
                disabled={verifying}
                onClick={() => {
                  setVerifyModalOpen(false)
                  setVerifyingOrder(null)
                  setVerificationError('')
                }}
              >
                Back
              </button>
              <button 
                className="driver-btn-confirm" 
                disabled={verifying}
                onClick={handleVerifyBags}
              >
                {verifying ? 'Verifying...' : 'Match & Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && activeOrder && (
        <div className="driver-modal-overlay">
          <div className="driver-modal-content">
            <h3 className="driver-modal-title">Collect Payment</h3>
            <p className="driver-modal-desc">Total due: <strong>QAR {activeOrder.total}</strong></p>
            
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Amount Collected (QAR)</label>
              <input 
                type="number" 
                value={collectedAmount} 
                onChange={(e) => setCollectedAmount(e.target.value)} 
                className="driver-select" 
                style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 0 }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', textAlign: 'left' }}>Payment Method</label>
              <button
                className={`driver-payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={14} /> Card (POS)
              </button>
              <button
                className={`driver-payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <Banknote size={14} /> Cash
              </button>
              <button
                className={`driver-payment-option ${paymentMethod === 'link' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('link')}
              >
                <Link size={14} /> Payment Link Sent
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="driver-btn-confirm" onClick={handleSuccess}>
                <Check size={14} />
                <span>Confirm</span>
              </button>
              <button className="driver-btn-cancel" onClick={() => setPaymentModalOpen(false)}>
                <X size={14} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failure Modal */}
      {failureModalOpen && activeOrder && (
        <div className="driver-modal-overlay">
          <div className="driver-modal-content">
            <h3 className="driver-modal-title">Report Failure</h3>
            <p className="driver-modal-desc">Select the reason for failed delivery.</p>
            
            <select 
              className="driver-select"
              value={failureReason}
              onChange={e => setFailureReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              <option value="customer_unreachable">Customer not answering</option>
              <option value="wrong_address">Wrong Address / Location</option>
              <option value="customer_rejected">Customer Rejected Order</option>
              <option value="payment_failed">Payment Failed</option>
              <option value="rescheduled">Customer Rescheduled</option>
            </select>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="driver-btn-confirm" disabled={!failureReason} onClick={handleFail}>
                <Check size={14} />
                <span>Submit Report</span>
              </button>
              <button className="driver-btn-cancel" onClick={() => setFailureModalOpen(false)}>
                <X size={14} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Collection Modal */}
      {returnCollectModalOpen && returnCollectItem && activeOrder && (
        <div className="driver-modal-overlay">
          <div className="driver-modal-content" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="driver-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, textTransform: 'none' }}>
                <RotateCcw size={18}/> Confirm Collection
              </h3>
              <button onClick={() => setReturnCollectModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg)' }}><X size={18}/></button>
            </div>
            
            <div style={{ background: 'var(--color-light-gray)', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>{returnCollectItem.itemName}</div>
              <div style={{ display: 'flex', gap: '12px', color: 'var(--color-muted)', fontSize: '11px' }}>
                <span>Type: <strong style={{ textTransform: 'uppercase' }}>{returnCollectItem.type}</strong></span>
                <span>Qty: <strong>{returnCollectItem.qty}</strong></span>
              </div>
              {returnCollectItem.reason && (
                <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--color-muted)' }}>
                  Reason: {returnCollectItem.reason === 'damaged' ? 'Damaged / Defective' :
                    returnCollectItem.reason === 'wrong' ? 'Wrong Item Sent' :
                    returnCollectItem.reason === 'expiry' ? 'Near Expiry / Expired' :
                    returnCollectItem.reason === 'mind' ? 'Customer Changed Mind' : returnCollectItem.reason}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Driver Note (optional)</label>
              <textarea
                value={returnDriverNote}
                onChange={(e) => setReturnDriverNote(e.target.value)}
                placeholder="Add any notes about the collection..."
                style={{
                  width: '100%', minHeight: '70px', padding: '8px',
                  border: '1.5px solid var(--color-border)', background: 'var(--color-bg)',
                  fontSize: '12px', fontFamily: 'var(--font-picker)', resize: 'none', outline: 'none'
                }}
              />
            </div>

            <div className="driver-info-box">
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Please verify you have physically received the item from the customer before confirming collection.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <button
                className="driver-btn-confirm"
                disabled={returnCollecting}
                onClick={async () => {
                  setReturnCollecting(true)
                  try {
                    await markReturnCollected(
                      activeOrder.id,
                      returnCollectItem.id,
                      user.email,
                      returnDriverNote
                    )
                    // Update local state
                    const updatedItems = activeOrder.returnItems.map(r =>
                      r.id === returnCollectItem.id
                        ? { ...r, status: 'picked up', collectedAt: new Date().toISOString(), collectedBy: user.email, driverNote: returnDriverNote || undefined }
                        : r
                    )
                    setActiveOrder({ ...activeOrder, returnItems: updatedItems })
                    success('Return item collected successfully')
                    setReturnCollectModalOpen(false)
                    loadOrders()
                  } catch (err) {
                    error('Failed to mark return as collected')
                  } finally {
                    setReturnCollecting(false)
                  }
                }}
              >
                <Check size={14} />
                <span>{returnCollecting ? 'Collecting...' : 'Confirm Collected'}</span>
              </button>
              <button className="driver-btn-cancel" onClick={() => setReturnCollectModalOpen(false)}>
                <X size={14} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
