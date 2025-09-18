// Set year if element exists
const yearElement = document.getElementById('y');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

function showScanner() {
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('#features').style.display = 'none';
  document.querySelector('.help-section').style.display = 'none';
  document.querySelector('.scanner-section').style.display = 'block';
  // Reset to input state when showing scanner
  showInputSections();
  window.scrollTo(0, 0);
}

function showHome() {
  document.querySelector('.hero').style.display = 'grid';
  document.querySelector('#features').style.display = 'block';
  document.querySelector('.scanner-section').style.display = 'none';
  document.querySelector('.help-section').style.display = 'none';
  document.getElementById('results').innerHTML = '';
  document.getElementById('url-input').value = '';
  // Reset to input state
  showInputSections();
  window.scrollTo(0, 0);
}

function showHelp() {
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('#features').style.display = 'none';
  document.querySelector('.scanner-section').style.display = 'none';
  document.querySelector('.help-section').style.display = 'block';
  window.scrollTo(0, 0);
}

// UI State Management Functions
function hideInputSections() {
  // Hide all scanner cards (URL and QR sections)
  const scannerCards = document.querySelectorAll('.scanner-card');
  scannerCards.forEach(card => {
    card.style.display = 'none';
  });
  
  // Hide the scanner section title/header if it exists
  const scannerHeader = document.querySelector('.scanner-section > div[style*="text-align:center"]');
  if (scannerHeader) scannerHeader.style.display = 'none';
}

function showInputSections() {
  // Show all scanner cards (URL and QR sections)
  const scannerCards = document.querySelectorAll('.scanner-card');
  scannerCards.forEach(card => {
    card.style.display = 'block';
  });
  
  // Show the scanner section title/header if it exists
  const scannerHeader = document.querySelector('.scanner-section > div[style*="text-align:center"]');
  if (scannerHeader) scannerHeader.style.display = 'block';
  
  // Clear results
  const resultsDiv = document.getElementById('results');
  if (resultsDiv) resultsDiv.innerHTML = '';
}

function showScanAgainButton() {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) {
    console.error('Results div not found for scan again button');
    return;
  }
  
  // Check if scan again button already exists
  if (resultsDiv.querySelector('.scan-again-container')) {
    console.log('Scan again button already exists');
    return;
  }
  
  // Add scan again button to results
  const scanAgainBtn = document.createElement('div');
  scanAgainBtn.className = 'scan-again-container';
  scanAgainBtn.style.cssText = `
    margin-top: 24px;
    text-align: center;
    padding: 0;
  `;
  scanAgainBtn.innerHTML = `
    <button onclick="scanAgain()" style="
      background: linear-gradient(135deg, #00d4ff, #0099cc);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 16px 32px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4), 0 4px 10px rgba(0, 0, 0, 0.15);
      position: relative;
      overflow: hidden;
      text-transform: uppercase;
      letter-spacing: 1px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      width: 100%;
      max-width: 600px;
      min-height: 60px;
    " onmouseover="
      this.style.transform='translateY(-3px) scale(1.02)'; 
      this.style.boxShadow='0 15px 35px rgba(0, 212, 255, 0.5), 0 8px 20px rgba(0, 0, 0, 0.2)';
      this.style.background='linear-gradient(135deg, #0099cc 0%, #00d4ff 100%)';
    " 
    onmouseout="
      this.style.transform='translateY(0) scale(1)'; 
      this.style.boxShadow='0 8px 25px rgba(0, 212, 255, 0.4), 0 4px 10px rgba(0, 0, 0, 0.15)';
      this.style.background='linear-gradient(135deg, #00d4ff, #0099cc)';
    "
    onmousedown="this.style.transform='translateY(1px) scale(0.98)'"
    onmouseup="this.style.transform='translateY(-3px) scale(1.02)'">
      <span style="
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 4v6h6"></path>
          <path d="M23 20v-6h-6"></path>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
        </svg>
        Scan Again
      </span>
    </button>
  `;
  
  resultsDiv.appendChild(scanAgainBtn);
  console.log('Scan again button added successfully');
}

function scanAgain() {
  console.log('Scan Again button clicked');
  showInputSections();
  clearAllInputs();
  window.scrollTo(0, 0);
}

// Make scanAgain globally accessible
window.scanAgain = scanAgain;

function clearAllInputs() {
  // Clear URL input
  const urlInput = document.getElementById('url-input');
  if (urlInput) urlInput.value = '';
  
  // Clear QR input
  clearQRFile();
  
  // Clear results
  const resultsDiv = document.getElementById('results');
  if (resultsDiv) resultsDiv.innerHTML = '';
}

// Flask API Configuration
const API_BASE = 'http://localhost:5000/api';

// Function to scan URL using ML model
async function scanURL() {
  const urlInput = document.getElementById('url-input');
  const resultsDiv = document.getElementById('results');
  
  if (!urlInput || !resultsDiv) {
    console.error('Required elements not found');
    return;
  }
  
  const url = urlInput.value.trim();
  if (!url) {
    alert('Please enter a URL to scan');
    return;
  }
  
  // Hide input sections immediately
  hideInputSections();
  
  // Show loading state
  resultsDiv.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #374151, #4b5563);
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      color: white;
      margin-top: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    ">
      <div style="
        width: 40px;
        height: 40px;
        border: 3px solid #3b82f6;
        border-top: 3px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      "></div>
      <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">🤖 Analyzing URL with ML model...</p>
      <p style="opacity: 0.7; margin: 0;">Extracting features and making prediction...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  
  try {
    const response = await fetch(`${API_BASE}/scan/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      displayMLResults(data);
    } else {
      throw new Error(data.error || 'Scan failed');
    }
  } catch (error) {
    console.error('Error scanning URL:', error);
    resultsDiv.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #7f1d1d, #991b1b);
        border-radius: 16px;
        padding: 24px;
        color: white;
        margin-top: 24px;
        border-left: 4px solid #ef4444;
      ">
        <h3 style="margin: 0 0 12px; color: #fca5a5;">❌ Error</h3>
        <p style="margin: 0 0 16px;">${error.message}</p>
        <p style="margin: 0 0 8px; font-weight: 600;">Make sure:</p>
        <ul style="margin: 0; padding-left: 20px; opacity: 0.9;">
          <li>Flask server is running (python app.py)</li>
          <li>ML model is trained (run LogisticRegression_Algorithm.ipynb)</li>
        </ul>
      </div>
    `;
    // Show scan again button even on error
    showScanAgainButton();
  }
}

// Function to display ML model results
function displayMLResults(data) {
  const resultsDiv = document.getElementById('results');
  
  let riskColor = '#10b981'; // green for safe
  let riskBgColor = '#059669';
  let riskIcon = '✅';
  let statusText = 'SAFE';
  let riskPercentage = data.risk_score || 0;
  
  if (!data.is_safe) {
    if (data.risk_score > 70) {
      riskColor = '#ef4444'; // red for high risk
      riskBgColor = '#dc2626';
      riskIcon = '🚨';
      statusText = 'HIGH RISK';
    } else {
      riskColor = '#f59e0b'; // yellow for medium risk
      riskBgColor = '#d97706';
      riskIcon = '⚠️';
      statusText = 'MEDIUM RISK';
    }
  }
  
  // Create the main result card matching your design
  resultsDiv.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #374151, #4b5563);
      border-radius: 16px;
      padding: 24px;
      color: white;
      margin-top: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      position: relative;
    ">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #10b981;">✅</span>
          <span style="font-weight: 600; font-size: 18px;">Security Analysis</span>
        </div>
        <div style="
          background: ${riskBgColor};
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        ">${statusText}</div>
      </div>
      <!-- Analyzed URL -->
      <div style="margin-bottom: 24px;">
        <div style="color: #d1d5db; font-weight: 600; margin-bottom: 8px;">Analyzed URL:</div>
        <div style="
          background: rgba(75, 85, 99, 0.8);
          padding: 12px 16px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          color: #60a5fa;
          word-break: break-all;
        ">${data.url}</div>
      </div>
      <!-- Stats Grid -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 24px;
      ">
        <div style="background: rgba(75, 85, 99, 0.6); padding: 16px; border-radius: 12px;">
          <div style="color: #9ca3af; font-size: 12px; margin-bottom: 4px;">PREDICTION:</div>
          <div style="color: ${riskColor}; font-weight: 700; font-size: 16px;">
            ${data.prediction ? data.prediction.toUpperCase() : 'N/A'}
          </div>
        </div>
        <div style="background: rgba(75, 85, 99, 0.6); padding: 16px; border-radius: 12px;">
          <div style="color: #9ca3af; font-size: 12px; margin-bottom: 4px;">CONFIDENCE:</div>
          <div style="color: white; font-weight: 600;">${data.confidence !== undefined ? data.confidence + '%' : 'N/A'}</div>
        </div>
      </div>
      <!-- Risk Level Bar -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="color: #d1d5db; font-weight: 600;">Risk Level</span>
          <span style="color: ${riskColor}; font-weight: 700;">${riskPercentage.toFixed(2)}%</span>
        </div>
        <div style="
          width: 100%;
          height: 8px;
          background: rgba(75, 85, 99, 0.8);
          border-radius: 4px;
          overflow: hidden;
        ">
          <div style="
            width: ${riskPercentage}%;
            height: 100%;
            background: linear-gradient(90deg, ${riskColor}, ${riskBgColor});
            border-radius: 4px;
            transition: width 0.8s ease;
          "></div>
        </div>
      </div>
      <!-- Collapsible Features Section -->
      <div style="margin-bottom: 24px;">
        <button id="features-toggle" onclick="toggleFeatures()" style="
          width: 100%;
          background: rgba(75, 85, 99, 0.6);
          border: none;
          border-radius: 12px;
          padding: 16px;
          color: #60a5fa;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(75, 85, 99, 0.8)'" 
           onmouseout="this.style.background='rgba(75, 85, 99, 0.6)'">
          <span>Features</span>
          <span id="toggle-icon">▼</span>
        </button>
        
        <div id="features-content" style="
          display: none;
          margin-top: 16px;
          background: rgba(75, 85, 99, 0.4);
          border-radius: 12px;
          padding: 16px;
        ">
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
          ">
            ${generateFeatureItems(data.features)}
          </div>
        </div>
      </div>
      <!-- Recommendation -->
      <div style="
        background: rgba(${data.is_safe ? '16, 185, 129' : '239, 68, 68'}, 0.2);
        border: 1px solid rgba(${data.is_safe ? '16, 185, 129' : '239, 68, 68'}, 0.3);
        border-radius: 12px;
        padding: 16px;
      ">
        <div style="font-weight: 600; margin-bottom: 8px;">Recommendation:</div>
        <div style="opacity: 0.9;">
          ${data.is_safe 
            ? '✅ This URL appears to be safe to visit.' 
            : '⚠️ Exercise caution with this URL. Consider additional verification before visiting.'}
        </div>
      </div>
    </div>
  `;
  
  // Add scan again button
  console.log('About to show scan again button after successful ML results');
  showScanAgainButton();
}

function generateFeatureItems(features) {
  if (!features) return '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">No features available</div>';
  
  const items = [];
  
  // Protocol
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Protocol:</div>
      <div style="
        background: ${features.Protocol ? '#1f2937' : '#7f1d1d'};
        color: ${features.Protocol ? '#fbbf24' : '#ef4444'};
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
      ">${features.Protocol ? '🔒 HTTPS' : '🔓 HTTP'}</div>
    </div>
  `);
  
  // Domain Length
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Domain Length:</div>
      <div style="color: white; font-weight: 600;">${features.DomainLength || 0} chars</div>
    </div>
  `);
  
  // URL Length
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">URL Length:</div>
      <div style="color: white; font-weight: 600;">${features.URLLength || 0} chars</div>
    </div>
  `);
  
  // Special Characters
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Special Characters:</div>
      <div style="color: white; font-weight: 600;">${features.SpecialCharCount || 0}</div>
    </div>
  `);
  
  // Is IP Address
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">IP Address:</div>
      <div style="
        background: ${features.IsIP ? '#7f1d1d' : '#1f2937'};
        color: ${features.IsIP ? '#ef4444' : '#10b981'};
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
      ">${features.IsIP ? '⚠️ Yes' : '✅ No'}</div>
    </div>
  `);
  
  // Entropy
  const entropyValue = features.Entropy !== undefined ? features.Entropy.toFixed(3) : 'N/A';
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Entropy:</div>
      <div style="color: white; font-weight: 600;">${entropyValue}</div>
    </div>
  `);
  
  return items.join('');
}

// Toggle features visibility
function toggleFeatures() {
  const content = document.getElementById('features-content');
  const icon = document.getElementById('toggle-icon');
  
  if (!content || !icon) return;
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.textContent = '▲';
  } else {
    content.style.display = 'none';
    icon.textContent = '▼';
  }
}

// Make toggleFeatures globally accessible
window.toggleFeatures = toggleFeatures;

// Check if Flask API and ML model are ready
async function checkAPIStatus() {
  try {
    const [healthResponse, modelResponse] = await Promise.all([
      fetch(`${API_BASE}/health`),
      fetch(`${API_BASE}/model/info`)
    ]);
    
    const healthData = await healthResponse.json();
    const modelData = await modelResponse.json();
    
    console.log('✅ Flask API Status:', healthData);
    console.log('🤖 ML Model Status:', modelData);
    
    if (!modelData.model_loaded) {
      console.warn('⚠️ ML Model not loaded! Run LogisticRegression_Algorithm.ipynb first');
    }
  } catch (error) {
    console.warn('⚠️ API/Model check failed:', error.message);
    console.warn('Make sure to run: python app.py');
  }
}

// Check API and model status when page loads
document.addEventListener('DOMContentLoaded', checkAPIStatus);

// IMPROVED QR SCANNER CODE
let selectedFile = null;

// Load jsQR dynamically from CDN with better error handling
function loadJSQR() {
  return new Promise((resolve, reject) => {
    if (window.jsQR) {
      console.log('jsQR already available');
      return resolve(window.jsQR);
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    
    const timeout = setTimeout(() => {
      script.remove();
      reject(new Error('jsQR loading timeout'));
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeout);
      console.log('jsQR loaded successfully');
      resolve(window.jsQR);
    };
    
    script.onerror = (e) => {
      clearTimeout(timeout);
      console.error('Failed to load jsQR', e);
      reject(new Error('Failed to load jsQR library'));
    };
    
    document.head.appendChild(script);
  });
}

function setupQRScanner() {
  const uploadArea = document.getElementById('qr-upload-area');
  const fileInput = document.getElementById('qr-file');
  const scanBtn = document.getElementById('scan-qr-btn');
  
  if (!uploadArea || !fileInput || !scanBtn) {
    console.error('setupQRScanner: missing required elements');
    return;
  }
  
  uploadArea.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    handleFileSelection(file, fileInput, scanBtn);
  });
  
  // Enhanced drag & drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadArea.contains(e.relatedTarget)) {
      uploadArea.classList.remove('dragover');
    }
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0], fileInput, scanBtn);
    }
  });
  
  scanBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    extractQRURL();
  });
}

function handleFileSelection(file, fileInput, scanBtn) {
  if (!file) {
    showQRResult('⚠️ No file selected', 'danger');
    return;
  }
  
  // More comprehensive file type checking
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
  if (!file.type || !validTypes.includes(file.type.toLowerCase())) {
    showQRResult('⚠️ Please select a valid image file (JPG, PNG, GIF, BMP, WebP)', 'danger');
    return;
  }
  
  // File size check (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    showQRResult('⚠️ File too large. Please select an image under 10MB', 'danger');
    return;
  }
  
  selectedFile = file;
  
  // Update file input
  try {
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
  } catch (err) {
    console.warn('DataTransfer not available, but selectedFile is set', err);
  }
  
  showFileSelected(file.name);
  if (scanBtn) scanBtn.disabled = false;
  
  console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
}

function showFileSelected(filename) {
  const uploadArea = document.getElementById('qr-upload-area');
  if (!uploadArea) return;
  
  uploadArea.innerHTML = `
    <div style="color: #10b981; font-weight: bold;">
      ✓ ${filename}
    </div>
    <small style="opacity:0.7; margin-top:8px; display:block;">
      Ready to scan - Click "SCAN QR" button
    </small>
  `;
}

async function extractQRURL() {
  const scanBtn = document.getElementById('scan-qr-btn');
  if (!scanBtn) {
    console.error('extractQRURL: scan button not found');
    return;
  }
  if (!selectedFile) {
    showQRResult('❌ Please select a QR code image first.', 'danger');
    return;
  }
  
  console.log('Starting QR extraction for file:', selectedFile.name);
  
  hideInputSections();
  const originalText = scanBtn.textContent;
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<div class="loading"></div> SCANNING...';
  
  // Show enhanced loading in results
  const resultsDiv = document.getElementById('results');
  if (resultsDiv) {
    resultsDiv.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #374151, #4b5563);
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        color: white;
        margin-top: 24px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid #3b82f6;
          border-top: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        "></div>
        <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">
          🔍 Extracting URL from QR code...
        </p>
        <p style="opacity: 0.7; margin: 0; font-size: 14px;">
          Processing: ${selectedFile.name}
        </p>
      </div>
    `;
  }
  
  try {
    const jsQRlib = await loadJSQR();
    const result = await processImageWithJSQR(selectedFile, jsQRlib);
    
    if (result) {
      console.log('QR code detected successfully:', result);
      
      // Auto-populate URL field and run ML scan
      const urlInput = document.getElementById('url-input');
      if (urlInput) urlInput.value = result;
      
      // Trigger ML scan immediately without showing "QR Code Found" message
      try { 
        scanURL(); 
      } catch (e) { 
        console.error('scanURL failed', e);
        showQRResult('❌ Failed to analyze extracted URL with ML model.', 'danger');
        showScanAgainButton();
      }
      
      setTimeout(clearQRFile, 1000); // Reduced delay
    } else {
      console.log('No QR code found in image');
      showQRResult('❌ No QR code detected in this image. Please try another image.', 'danger');
      showScanAgainButton();
    }
  } catch (err) {
    console.error('QR extraction error:', err);
    showQRResult(`❌ Failed to scan QR code: ${err.message}`, 'danger');
    showScanAgainButton();
  } finally {
    scanBtn.disabled = false;
    scanBtn.textContent = originalText;
  }
}

// Enhanced image processing with multiple techniques
function processImageWithJSQR(file, jsQRlib) {
  return new Promise((resolve, reject) => {
    console.log('Processing image with jsQR...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = function() {
        console.log('Image loaded:', img.width, 'x', img.height);
        
        try {
          // Try multiple processing techniques
          const results = [
            tryDirectScan(img, jsQRlib),
            tryResizedScan(img, jsQRlib, 800), // Resize to 800px max
            tryContrastEnhanced(img, jsQRlib),
            tryGrayscaleProcessing(img, jsQRlib)
          ];
          
          // Return first successful result
          for (const result of results) {
            if (result) {
              console.log('QR code found using processing technique');
              resolve(result);
              return;
            }
          }
          
          console.log('No QR code found after trying all techniques');
          resolve(null);
          
        } catch (err) {
          console.error('Error processing image:', err);
          reject(err);
        }
      };
      
      img.onerror = () => {
        console.error('Failed to load image');
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      console.error('Failed to read file');
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Direct scan without modifications
function tryDirectScan(img, jsQRlib) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Try different inversion methods
    let code = jsQRlib(imageData.data, imageData.width, imageData.height, { 
      inversionAttempts: "dontInvert" 
    });
    
    if (!code) {
      code = jsQRlib(imageData.data, imageData.width, imageData.height, { 
        inversionAttempts: "onlyInvert" 
      });
    }
    
    if (!code) {
      code = jsQRlib(imageData.data, imageData.width, imageData.height, { 
        inversionAttempts: "attemptBoth" 
      });
    }
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Direct scan failed:', err);
    return null;
  }
}

// Resize image for better processing
function tryResizedScan(img, jsQRlib, maxSize) {
  try {
    let { width, height } = img;
    
    // Calculate new dimensions
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    
    // Use better image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    
    let code = jsQRlib(imageData.data, width, height, { 
      inversionAttempts: "attemptBoth" 
    });
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Resized scan failed:', err);
    return null;
  }
}

// Enhance contrast for better QR detection
function tryContrastEnhanced(img, jsQRlib) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Enhance contrast
    const factor = 2.0; // Contrast factor
    const intercept = 128 * (1 - factor);
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] * factor + intercept));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor + intercept)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor + intercept)); // B
    }
    
    let code = jsQRlib(data, canvas.width, canvas.height, { 
      inversionAttempts: "attemptBoth" 
    });
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Contrast enhanced scan failed:', err);
    return null;
  }
}

// Convert to grayscale and apply threshold
function tryGrayscaleProcessing(img, jsQRlib) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert to grayscale and apply threshold
    const threshold = 128;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.floor(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      const bw = gray > threshold ? 255 : 0;
      
      data[i] = bw;     // R
      data[i + 1] = bw; // G
      data[i + 2] = bw; // B
    }
    
    let code = jsQRlib(data, canvas.width, canvas.height, { 
      inversionAttempts: "attemptBoth" 
    });
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Grayscale processing failed:', err);
    return null;
  }
}

function clearQRFile() {
  selectedFile = null;
  const fileInput = document.getElementById('qr-file');
  if (fileInput) fileInput.value = '';
  
  const uploadArea = document.getElementById('qr-upload-area');
  if (uploadArea) {
    uploadArea.innerHTML = `
      <div>Click to upload or drop QR code here</div>
      <small style="opacity:0.7; margin-top:8px; display:block;">
        Supports JPG, PNG
      </small>
    `;
  }
  
  const scanBtn = document.getElementById('scan-qr-btn');
  if (scanBtn) scanBtn.disabled = true;
}

function showQRResult(message, type) {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) {
    console.warn('showQRResult: no #results element');
    return;
  }
  
  const isError = type === 'danger';
  const isSuccess = type === 'success';
  
  let borderColor, bgColor, title, icon;
  
  if (isError) {
    borderColor = '#ef4444';
    bgColor = 'linear-gradient(135deg, #7f1d1d, #991b1b)';
    title = '❌ Scan Failed';
    icon = '❌';
  } else if (isSuccess) {
    borderColor = '#10b981';
    bgColor = 'linear-gradient(135deg, #065f46, #047857)';
    title = '✅ QR Code Found';
    icon = '✅';
  } else {
    borderColor = '#6b7280';
    bgColor = 'linear-gradient(135deg, #374151, #4b5563)';
    title = 'ℹ️ Info';
    icon = 'ℹ️';
  }
  
  resultsDiv.innerHTML = `
    <div style="
      background: ${bgColor};
      border-radius: 16px;
      padding: 24px;
      color: white;
      margin-top: 24px;
      border-left: 4px solid ${borderColor};
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      ">
        <span style="font-weight: 600; font-size: 18px;">${title}</span>
      </div>
      <div style="opacity: 0.9;">
        <p style="margin: 0; line-height: 1.5;">${message}</p>
      </div>
    </div>
  `;
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Attach event listeners
  const scanUrlBtn = document.getElementById('scan-url-btn');
  if (scanUrlBtn) {
    scanUrlBtn.addEventListener('click', (e) => { 
      e.preventDefault(); 
      scanURL(); 
    });
  }
  
  // Start API check and QR setup
  checkAPIStatus();
  setupQRScanner();
  
  // Ensure scan-qr button starts disabled
  const scanBtn = document.getElementById('scan-qr-btn');
  if (scanBtn) scanBtn.disabled = true;
  
  // Pre-load jsQR library
  loadJSQR().then(() => {
    console.log('jsQR pre-loaded successfully');
  }).catch(err => {
    console.warn('Failed to pre-load jsQR:', err);
  });
});