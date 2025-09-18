"""
URL Scanner Module
Handles all URL-related functionality: feature extraction, ML model loading, and classification
"""
import pickle
import numpy as np
from urllib.parse import urlparse
import re
import math
from collections import Counter
import os

class URLScanner:
    def __init__(self, model_dir=None):
        if model_dir is None:
            # Get absolute path to Models directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(current_dir)  # Go up one level from Scanner to Backend
            self.model_dir = os.path.join(backend_dir, 'Models')
        else:
            self.model_dir = model_dir
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.load_model()
    
    def load_model(self):
        """Load the trained ML model, scaler, and label encoder"""
        try:
            model_path = os.path.join(self.model_dir, 'logistic_model.pkl')
            scaler_path = os.path.join(self.model_dir, 'scaler.pkl')
            encoder_path = os.path.join(self.model_dir, 'label_encoder.pkl')
            
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print("✅ URL Scanner: Model loaded successfully")
            
            if os.path.exists(scaler_path):
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                print("✅ URL Scanner: Scaler loaded successfully")
                
            if os.path.exists(encoder_path):
                with open(encoder_path, 'rb') as f:
                    self.label_encoder = pickle.load(f)
                print("✅ URL Scanner: Label encoder loaded successfully")
                
        except Exception as e:
            print(f"❌ URL Scanner: Error loading model - {e}")
    
    def extract_features(self, url):
        """Extract features from URL (matches our new trained model - 15 features)
        
        Features in order match the notebook training:
        "url_length", "num_dots", "num_hyphens", "num_at", "num_digits",
        "num_params", "num_slashes", "num_question", "num_percent", "num_special",
        "domain_length", "path_length", "has_https", "has_http", "has_suspicious_kw"
        """
        try:
            parsed = urlparse(url)
        except:
            parsed = None

        url_length = len(url)
        num_dots = url.count(".")
        num_hyphens = url.count("-")
        num_at = url.count("@")
        num_digits = sum(c.isdigit() for c in url)
        num_params = url.count("=")
        num_slashes = url.count("/")
        num_question = url.count("?")
        num_percent = url.count("%")
        num_special = sum(c in [';', '_', '?', '=', '&'] for c in url)

        hostname = parsed.hostname if parsed and parsed.hostname else ""
        domain_length = len(hostname)

        path_length = len(parsed.path) if parsed and parsed.path else 0
        has_https = 1 if parsed and parsed.scheme == "https" else 0
        has_http = 1 if parsed and parsed.scheme == "http" else 0

        keywords = ["login", "secure", "update", "free", "verify", "bank", "account", "paypal"]
        has_suspicious_kw = 1 if any(kw in url.lower() for kw in keywords) else 0

        # Create feature array with 15 features (matching our trained model)
        feature_array = [
            url_length, num_dots, num_hyphens, num_at, num_digits,
            num_params, num_slashes, num_question, num_percent, num_special,
            domain_length, path_length, has_https, has_http,
            has_suspicious_kw
        ]
        
        return {
            'url_length': url_length,
            'num_dots': num_dots,
            'num_hyphens': num_hyphens,
            'num_at': num_at,
            'num_digits': num_digits,
            'num_params': num_params,
            'num_slashes': num_slashes,
            'num_question': num_question,
            'num_percent': num_percent,
            'num_special': num_special,
            'domain_length': domain_length,
            'path_length': path_length,
            'has_https': has_https,
            'has_http': has_http,
            'has_suspicious_kw': has_suspicious_kw,
            'feature_array': feature_array
        }
    
    def classify_url(self, url):
        """Main function: Analyze URL and return detailed results"""
        if not self.model or not self.scaler:
            return {
                'error': 'Model not loaded. Please run LogisticRegression_Algorithm.ipynb first to train the model.',
                'prediction': 'unknown',
                'is_safe': None,
                'confidence': 0,
                'risk_score': 0,
                'features': {}
            }
        
        try:
            # Extract features
            feature_data = self.extract_features(url)
            features = feature_data['feature_array']
            
            # Scale features
            scaled_features = self.scaler.transform([features])
            
            # Make prediction
            prediction = self.model.predict(scaled_features)[0]
            probabilities = self.model.predict_proba(scaled_features)[0]
            
            # Get risk score (probability of being malicious)
            risk_score = probabilities[1] * 100
            confidence = max(probabilities) * 100
            
            # Enhanced risk classification with medium risk category
            if risk_score < 35:
                is_safe = True
                prediction_text = 'benign'
                risk_level = 'low'
            elif 35 <= risk_score < 70:
                is_safe = False
                prediction_text = 'medium risk'
                risk_level = 'medium'
            else:  # risk_score >= 70
                is_safe = False
                prediction_text = 'malicious'
                risk_level = 'high'
            
            return {
                'url': url,
                'prediction': prediction_text,
                'is_safe': is_safe,
                'confidence': round(confidence, 2),
                'risk_score': round(risk_score, 2),
                'risk_level': risk_level,
                'features': {
                    'url_length': feature_data['url_length'],
                    'num_dots': feature_data['num_dots'],
                    'num_hyphens': feature_data['num_hyphens'],
                    'num_at': feature_data['num_at'],
                    'num_digits': feature_data['num_digits'],
                    'num_params': feature_data['num_params'],
                    'num_slashes': feature_data['num_slashes'],
                    'num_question': feature_data['num_question'],
                    'num_percent': feature_data['num_percent'],
                    'num_special': feature_data['num_special'],
                    'domain_length': feature_data['domain_length'],
                    'path_length': feature_data['path_length'],
                    'has_https': feature_data['has_https'],
                    'has_http': feature_data['has_http'],
                    'has_suspicious_kw': feature_data['has_suspicious_kw']
                },
                'domain': urlparse(url).netloc,
                'model_used': 'logistic_regression'
            }
            
        except Exception as e:
            return {
                'error': f'Classification failed: {str(e)}',
                'prediction': 'unknown',
                'is_safe': None,
                'confidence': 0,
                'risk_score': 0,
                'features': {}
            }
    
    def get_model_status(self):
        """Get status of loaded models"""
        return {
            'model_loaded': self.model is not None,
            'scaler_loaded': self.scaler is not None,
            'label_encoder_loaded': self.label_encoder is not None,
            'model_files': {
                'logistic_model.pkl': os.path.exists(os.path.join(self.model_dir, 'logistic_model.pkl')),
                'scaler.pkl': os.path.exists(os.path.join(self.model_dir, 'scaler.pkl')),
                'label_encoder.pkl': os.path.exists(os.path.join(self.model_dir, 'label_encoder.pkl'))
            }
        }

# Global scanner instance (singleton pattern)
url_scanner = URLScanner()

# Convenience functions for easy import
def scan_url(url):
    """Convenience function to scan a single URL"""
    return url_scanner.classify_url(url)

def get_scanner_status():
    """Get scanner model status"""
    return url_scanner.get_model_status()

# Test function
if __name__ == "__main__":
    test_urls = [
        "https://www.google.com",
        "http://malicious-site.tk/login?id=123&password=test",
        "https://github.com/user/repo",
        "http://192.168.1.1/admin"
    ]
    
    print("🔍 Testing URL Scanner...")
    print("=" * 50)
    
    for url in test_urls:
        result = scan_url(url)
        print(f"URL: {url}")
        if 'error' in result:
            print(f"❌ Error: {result['error']}")
        else:
            print(f"🎯 Prediction: {result['prediction'].upper()}")
            print(f"📊 Risk Score: {result['risk_score']}%")
            print(f"✅ Safe: {'Yes' if result['is_safe'] else 'No'}")
        print("-" * 50)