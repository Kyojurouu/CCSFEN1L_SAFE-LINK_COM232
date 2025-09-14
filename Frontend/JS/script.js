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
      console.log('scanURL function called');
      const urlInput = document.getElementById('url-input');
      const resultsDiv = document.getElementById('results');
      
      console.log('Found elements:', { urlInput: !!urlInput, resultsDiv: !!resultsDiv });
      
      if (!urlInput || !resultsDiv) {
        console.error('Required elements not found');
        return;
      }

      const url = urlInput.value.trim();
      console.log('URL to scan:', url);
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

      // Format features for display
      const featuresHtml = `
        <div class="features-grid">
          <div>Protocol: ${data.features.Protocol ? 'HTTPS' : 'HTTP'}</div>
          <div>Domain Length: ${data.features.DomainLength}</div>
          <div>URL Length: ${data.features.URLLength}</div>
          <div>Subdomains: ${data.features.Subdomains}</div>
          <div>Special Chars: ${data.features.SpecialCharCount}</div>
          <div>Is IP: ${data.features.IsIP ? 'Yes' : 'No'}</div>
          <div>TLD .com: ${data.features['TLD_.com'] ? 'Yes' : 'No'}</div>
          <div>Brand Keywords: ${data.features.BrandKeywords}</div>
        </div>
      `;

      resultsDiv.innerHTML = `
        <div class="scan-result" style="border-left: 4px solid ${riskColor}">
          <h3>${riskIcon} ML Model Results</h3>
          <p><strong>URL:</strong> ${data.url}</p>
          <p><strong>Prediction:</strong> <span style="color: ${riskColor}; font-weight: bold;">${data.prediction.toUpperCase()}</span></p>
          <p><strong>Status:</strong> <span style="color: ${riskColor}; font-weight: bold;">${statusText}</span></p>
          <p><strong>Risk Score:</strong> ${data.risk_score}% (Confidence: ${data.confidence}%)</p>
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

    // Initialize API check and event listeners when page loads
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM Content Loaded');
      checkAPIStatus();
      
      // Add event listeners for buttons
      const scanUrlBtn = document.getElementById('scan-url-btn');
      const urlInput = document.getElementById('url-input');
      const scannerSection = document.querySelector('.scanner-section');
      
      console.log('Found elements:', { 
        scanUrlBtn: !!scanUrlBtn, 
        urlInput: !!urlInput, 
        scannerSection: !!scannerSection,
        scannerVisible: scannerSection ? scannerSection.style.display : 'unknown'
      });
      
      if (scanUrlBtn) {
        console.log('Adding click event listener to scan button');
        scanUrlBtn.addEventListener('click', function(e) {
          console.log('🔥 SCAN BUTTON CLICKED!');
          e.preventDefault();
          
          // Check if scanner section is visible
          const scanner = document.querySelector('.scanner-section');
          if (scanner && scanner.style.display === 'none') {
            console.log('⚠️ Scanner section is hidden! User needs to click START SCANNING first');
            alert('Please click "START SCANNING" button first to access the scanner!');
            return;
          }
          
          scanURL();
        });
      } else {
        console.error('❌ SCAN BUTTON NOT FOUND!');
      }
      
      if (urlInput) {
        urlInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            console.log('Enter key pressed in URL input');
            
            // Check if scanner section is visible
            const scanner = document.querySelector('.scanner-section');
            if (scanner && scanner.style.display === 'none') {
              console.log('⚠️ Scanner section is hidden! User needs to click START SCANNING first');
              alert('Please click "START SCANNING" button first to access the scanner!');
              return;
            }
            
            scanURL();
          }
        });
      }
    });