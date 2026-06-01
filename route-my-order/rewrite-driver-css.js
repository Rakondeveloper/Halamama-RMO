const fs = require('fs');
const cssPath = './src/pages/driver/driver.css';

let css = fs.readFileSync(cssPath, 'utf8');

css += `
/* NEW PHASE 4 STRUCTURE STYLES */
.driver-vertical-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.driver-vertical-metric-card {
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.driver-vertical-metric-card .metric-title {
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 8px;
}

.driver-vertical-metric-card .metric-value {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
}

.driver-vertical-metric-card .metric-subtitle {
  font-size: 11px;
  color: var(--color-muted);
}

.driver-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.driver-status-pill {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  text-transform: uppercase;
  border: 1.5px solid var(--color-border);
  background: var(--color-light-gray);
  color: var(--color-fg);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.driver-status-pill.accepted { background: var(--color-light-gray); }
.driver-status-pill.verified { background: var(--color-bg); }

.driver-order-details {
  font-size: 12px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.driver-btn-outline {
  background: var(--color-bg);
  color: var(--color-fg);
  border: 1.5px solid var(--color-border);
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  text-transform: uppercase;
}
.driver-btn-outline:hover {
  background: var(--color-light-gray);
}

.driver-summary-status-card,
.driver-summary-card {
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  padding: 16px;
  margin-bottom: 12px;
}

.driver-summary-date {
  font-size: 11px;
  color: var(--color-muted);
}

.driver-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1.5px solid var(--color-border);
}

.driver-badge {
  font-size: 10px;
  font-weight: 800;
  background: var(--color-light-gray);
  padding: 4px 8px;
  border: 1.5px solid var(--color-border);
}

.driver-item-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.driver-item-image {
  width: 48px;
  height: 48px;
  background: var(--color-light-gray);
  border: 1.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.driver-item-details { flex: 1; }

.driver-item-name {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 4px;
}

.driver-item-meta {
  font-size: 11px;
  color: var(--color-muted);
  display: flex;
  gap: 12px;
}

.driver-card-title {
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 12px;
}

.driver-info-label {
  font-size: 11px;
  color: var(--color-muted);
  margin-bottom: 4px;
}

.driver-info-value {
  font-size: 13px;
  font-weight: 600;
}

.driver-verification-metrics {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.metric-box {
  flex: 1;
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  padding: 16px;
  text-align: center;
}

.metric-box .label {
  font-size: 10px;
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--color-muted);
}

.metric-box .value {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-fg);
}

.driver-info-box,
.driver-warning-box {
  padding: 12px;
  border: 1.5px solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 12px;
  line-height: 1.4;
}

.driver-info-box { background: var(--color-light-gray); }
.driver-warning-box { background: var(--color-bg); border-style: dashed; }
`;

fs.writeFileSync(cssPath, css);
console.log('CSS updated');
