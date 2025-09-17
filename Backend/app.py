# SafeLink Flask API - Clean API layer that connects to URL Scanner
# pip install flask flask-cors scikit-learn joblib

from flask import Flask, request, jsonify
from flask_cors import CORS
from Scanner.url_scanner import scan_url, get_scanner_status
import numpy as np

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS para ma-access ng frontend

@app.route('/api/health', methods=['GET'])
def health():
    """Check if API and ML model are running"""
    scanner_status = get_scanner_status()
    return jsonify({
        'status': 'ok',
        'message': 'SafeLink API is running',
        'model_status': 'loaded' if scanner_status['model_loaded'] else 'not_found'
    })

@app.route('/api/scan/url', methods=['POST'])
def scan_url_endpoint():
    """Scan URL using trained ML model"""
    try:
        # Get JSON data from request
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'error': 'URL is required'}), 400
        
        url = data['url'].strip()
        if not url:
            return jsonify({'error': 'URL cannot be empty'}), 400
        
        # Use URL Scanner to classify URL
        result = scan_url(url)
        
        if 'error' in result:
            return jsonify({
                'error': result['error'],
                'url': url,
                'fallback': True
            }), 500
        
        # URL Scanner returns complete formatted response
        # Convert numpy types to Python native types for JSON serialization
        response = {
            'url': str(result['url']),
            'domain': str(result['domain']),
            'prediction': str(result['prediction']),
            'confidence': float(result['confidence']),
            'risk_score': float(result['risk_score']),
            'is_safe': bool(result['is_safe']),
            'risk_level': str(result['risk_level']),
            'features': {k: int(v) if isinstance(v, (bool, np.bool_)) else float(v) if isinstance(v, (np.integer, np.floating)) else v 
                        for k, v in result['features'].items()},
            'model_used': str(result['model_used'])
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/scan/qr', methods=['POST'])
def scan_qr():
    """Scan QR code (placeholder for future implementation)"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # For now, return placeholder response
        return jsonify({
            'status': 'success',
            'message': 'QR scanning feature will be implemented',
            'filename': file.filename
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded ML model"""
    scanner_status = get_scanner_status()
    
    return jsonify({
        'model_loaded': scanner_status['model_loaded'],
        'scaler_loaded': scanner_status['scaler_loaded'],
        'label_encoder_loaded': scanner_status['label_encoder_loaded'],
        'model_files': scanner_status['model_files'],
        'feature_names': ['Protocol', 'DomainLength', 'URLLength', 'SpecialCharCount', 'IsIP', 'Entropy']
    })

if __name__ == '__main__':
    print("🚀 Starting SafeLink API with ML Model...")
    print("📊 Make sure you've run LogisticRegression_Algorithm.ipynb to train the model first!")
    print("🌐 API will be available at: http://localhost:5000")
    print("🔍 Test endpoint: http://localhost:5000/api/health")
    app.run(host='0.0.0.0', port=5000, debug=True)
