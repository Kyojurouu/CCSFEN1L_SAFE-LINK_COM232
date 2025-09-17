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
      window.scrollTo(0, 0);
    }
 
    function showHome() {
      document.querySelector('.hero').style.display = 'grid';
      document.querySelector('#features').style.display = 'block';
      document.querySelector('.scanner-section').style.display = 'none';
      document.querySelector('.help-section').style.display = 'none';
      document.getElementById('results').innerHTML = '';
      document.getElementById('url-input').value = '';
      window.scrollTo(0, 0);
    }
 
    function showHelp() {
      document.querySelector('.hero').style.display = 'none';
      document.querySelector('#features').style.display = 'none';
      document.querySelector('.scanner-section').style.display = 'none';
      document.querySelector('.help-section').style.display = 'block';
      window.scrollTo(0, 0);
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

      // Show loading state
      resultsDiv.innerHTML = `
        <div class="result-loading">
          <p>🤖 Analyzing URL with ML model...</p>
          <p>Extracting features and making prediction...</p>
        </div>
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
          <div class="result-error">
            <p>❌ Error: ${error.message}</p>
            <p>Make sure:</p>
            <ul>
              <li>Flask server is running (python app.py)</li>
              <li>ML model is trained (run LogisticRegression_Algorithm.ipynb)</li>
            </ul>
          </div>
        `;
      }
    }

    // Function to display ML model results
    function displayMLResults(data) {
      const resultsDiv = document.getElementById('results');
      
      let riskColor = '#28a745'; // green for safe
      let riskIcon = '✅';
      let statusText = 'Safe';
      
      if (!data.is_safe) {
        if (data.risk_score > 70) {
          riskColor = '#dc3545'; // red for high risk
          riskIcon = '🚨';
          statusText = 'High Risk';
        } else {
          riskColor = '#ffc107'; // yellow for medium risk
          riskIcon = '⚠️';
          statusText = 'Medium Risk';
        }
      }

      // Safely get Entropy value
      let entropyValue = "N/A";
      if (data.features && typeof data.features.Entropy === "number") {
        entropyValue = data.features.Entropy.toFixed(3);
      }

      // Format features for display
      const featuresHtml = `
        <div class="features-grid">
          <div>Protocol: ${data.features.Protocol ? 'HTTPS' : 'HTTP'}</div>
          <div>Domain Length: ${data.features.DomainLength}</div>
          <div>URL Length: ${data.features.URLLength}</div>
          <div>Special Chars: ${data.features.SpecialCharCount}</div>
          <div>Is IP: ${data.features.IsIP ? 'Yes' : 'No'}</div>
        </div>
      `;

      resultsDiv.innerHTML = `
        <div class="scan-result" style="border-left: 4px solid ${riskColor}">
          <h3>${riskIcon} ML Model Results</h3>
          <p><strong>URL:</strong> ${data.url}</p>
          <p><strong>Prediction:</strong> <span style="color: ${riskColor}; font-weight: bold;">${data.prediction ? data.prediction.toUpperCase() : ''}</span></p>
          <p><strong>Status:</strong> <span style="color: ${riskColor}; font-weight: bold;">${statusText}</span></p>
          <p><strong>Risk Score:</strong> ${data.risk_score !== undefined ? data.risk_score + '%' : 'N/A'} (Confidence: ${data.confidence !== undefined ? data.confidence + '%' : 'N/A'})</p>
          <p><strong>Model:</strong> ${data.model_used}</p>
          
          <div class="features-section">
            <strong>📊 Extracted Features:</strong>
            ${featuresHtml}
          </div>
          
          <div class="recommendation">
            <strong>💡 Recommendation:</strong>
            ${data.is_safe 
              ? '✅ This URL appears to be safe to visit.' 
              : '⚠️ Exercise caution with this URL. Consider additional verification before visiting.'}
          </div>
        </div>
      `;
    }

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

     let selectedFile = null;

// Load jsQR dynamically from CDN
function loadJSQR() {
  return new Promise((resolve, reject) => {
    if (window.jsQR) {
      console.log('jsQR already available');
      return resolve(window.jsQR);
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    script.onload = () => {
      console.log('jsQR loaded');
      resolve(window.jsQR);
    };
    script.onerror = (e) => {
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
    console.error('setupQRScanner: missing #qr-upload-area, #qr-file, or #scan-qr-btn');
    return;
  }

  uploadArea.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    handleFileSelection(f, fileInput, scanBtn);
  });

  // Drag & drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0], fileInput, scanBtn);
    }
  });

  // Scan button (fallback - handler here too)
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
  if (!file.type || !file.type.startsWith('image/')) {
    showQRResult('⚠️ Please select an image file (JPG, PNG, etc.)', 'danger');
    return;
  }

  // Save selectedFile
  selectedFile = file;

  // Properly populate the file input using DataTransfer (safe cross-browser)
  try {
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
  } catch (err) {
    // If DataTransfer isn't supported, just ignore — selectedFile is set and will be used.
    console.warn('DataTransfer not available; file input may not show filename', err);
  }

  showFileSelected(file.name);
  if (scanBtn) scanBtn.disabled = false;
}

function showFileSelected(filename) {
  const uploadArea = document.getElementById('qr-upload-area');
  if (!uploadArea) return;
  uploadArea.innerHTML = `
    <div style="color: #10b981;"><strong>✓ ${filename}</strong></div>
    <small style="opacity:0.7; margin-top:8px; display:block">Ready to scan - Click "SCAN QR" button</small>
  `;
}

function extractQRURL() {
  const scanBtn = document.getElementById('scan-qr-btn');
  if (!scanBtn) {
    console.error('extractQRURL: no scan button found');
    return;
  }

  if (!selectedFile) {
    return showQRResult('❌ Please select a QR code image first.', 'danger');
  }

  const originalText = scanBtn.textContent;
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<div class="loading"></div> SCANNING...';

  loadJSQR()
    .then((jsQRlibrary) => {
      if (!jsQRlibrary && !window.jsQR) {
        throw new Error('jsQR not available after load');
      }
      const lib = jsQRlibrary || window.jsQR;
      return processImageWithJSQR(selectedFile, lib);
    })
    .then(result => {
      if (result) {
        // Success - show green card and auto-run ML scan
        showQRResult('✅ QR code extracted! ' + result, 'safe');
        const urlInput = document.getElementById('url-input');
        if (urlInput) urlInput.value = result;
        // Trigger ML scan (if API is desired)
        try { scanURL(); } catch (e) { console.warn('scanURL failed', e); }
        setTimeout(clearQRFile, 1700);
      } else {
        // No QR found - show red/danger card (same style as success)
        showQRResult('❌ No QR code detected in this image.', 'danger');
      }
    })
    .catch(err => {
      console.error('QR extraction error:', err);
      showQRResult('❌ Failed to scan the QR code image. See console for details.', 'danger');
    })
    .finally(() => {
      scanBtn.disabled = false;
      scanBtn.textContent = originalText;
    });
}

function processImageWithJSQR(file, jsQRlib) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = function() {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // try to get image data (may throw for big images)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // try different inversion attempts like original code
          let code = null;
          try {
            code = jsQRlib(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
            if (!code) code = jsQRlib(imageData.data, imageData.width, imageData.height, { inversionAttempts: "onlyInvert" });
            if (!code) code = jsQRlib(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
          } catch (err) {
            console.error('jsQR threw:', err);
          }

          resolve(code ? code.data : null);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Image load error'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });
}

function clearQRFile() {
  selectedFile = null;
  const fileInput = document.getElementById('qr-file');
  if (fileInput) fileInput.value = '';
  const uploadArea = document.getElementById('qr-upload-area');
  if (uploadArea) {
    uploadArea.innerHTML = `
      <div>Click to upload or drop QR code here</div>
      <small style="opacity:0.7; margin-top:8px; display:block">Supports JPG, PNG files</small>
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
  const cardClass = type === 'safe' ? 'safe' : (type === 'warning' ? 'warning' : 'danger');
  const title = type === 'safe' ? 'Success' : (type === 'warning' ? 'Warning' : 'Failed Scan');

  resultsDiv.innerHTML = `
    <div class="result-card ${cardClass}">
      <div class="result-title">${title}</div>
      <div class="result-details"><p>${message}</p></div>
    </div>
  `;
}

// ---- Init on load ----
document.addEventListener('DOMContentLoaded', () => {
  // Attach a click to SCAN URL button to ensure it works
  const scanUrlBtn = document.getElementById('scan-url-btn');
  if (scanUrlBtn) scanUrlBtn.addEventListener('click', (e) => { e.preventDefault(); scanURL(); });

  // Start API check and QR setup
  checkAPIStatus();
  setupQRScanner();

  // Ensure scan-qr button initially disabled
  const scanBtn = document.getElementById('scan-qr-btn');
  if (scanBtn) scanBtn.disabled = true;

  // Start pre-loading jsQR (non-blocking)
  loadJSQR().catch(err => console.warn('Preload jsQR failed:', err));
});