"""
URL Scanner Module
Handles all URL-related functionality: feature extraction, ML model loading, and classification
"""
import joblib
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
                self.model = joblib.load(model_path)
                print("✅ URL Scanner: Model loaded successfully")
            
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
                print("✅ URL Scanner: Scaler loaded successfully")
                
            if os.path.exists(encoder_path):
                self.label_encoder = joblib.load(encoder_path)
                print("✅ URL Scanner: Label encoder loaded successfully")
                
        except Exception as e:
            print(f"❌ URL Scanner: Error loading model - {e}")
    
    def extract_features(self, url):
        """Extract features from URL (matches final trained model - 18 features, entropy removed)
        
        Features in order:
        1. Protocol, 2. DomainLength, 3. URLLength, 4. Subdomains, 5. SpecialCharCount, 
        6. IsIP, 7-17. TLD features (.com, .org, etc.), 18. BrandKeywords
        """
        parsed = urlparse(url)
        
        # 1. Protocol (0 for http, 1 for https)
        protocol = 1 if parsed.scheme == 'https' else 0
        
        # 2. Domain length
        domain = parsed.netloc
        domain_length = len(domain)
        
        # 3. URL length
        url_length = len(url)
        
        # 4. Subdomains count (count the number of dots in domain)
        subdomains = domain.count('.') if domain else 0
        
        # 5. Special character count
        special_chars = ['@', '#', '$', '%', '&', '*', '+', '=', '?', '^', '`', '|', '~']
        special_char_count = sum(url.count(char) for char in special_chars)
        
        # 6. IsIP - check if domain is an IP address
        ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
        is_ip = 1 if re.match(ip_pattern, domain) else 0
        
        # 7-17. TLD (Top Level Domain) features - one-hot encoding
        domain_lower = domain.lower()
        tld_com = 1 if domain_lower.endswith('.com') else 0
        tld_org = 1 if domain_lower.endswith('.org') else 0
        tld_net = 1 if domain_lower.endswith('.net') else 0
        tld_edu = 1 if domain_lower.endswith('.edu') else 0
        tld_gov = 1 if domain_lower.endswith('.gov') else 0
        tld_xyz = 1 if domain_lower.endswith('.xyz') else 0
        tld_top = 1 if domain_lower.endswith('.top') else 0
        tld_ru = 1 if domain_lower.endswith('.ru') else 0
        tld_cn = 1 if domain_lower.endswith('.cn') else 0
        tld_zip = 1 if domain_lower.endswith('.zip') else 0
        tld_info = 1 if domain_lower.endswith('.info') else 0
        
        # 19. Brand keywords (simplified check for common brand keywords)
        brand_keywords = ['amazon', 'google', 'microsoft', 'apple', 'facebook', 'paypal', 'ebay', 'netflix', 'twitter', 'instagram']
        brand_keyword_count = sum(1 for keyword in brand_keywords if keyword in url.lower())
        
        # Create feature array with 18 features (without entropy - matching final trained model)
        feature_array = [
            protocol, domain_length, url_length, subdomains, special_char_count, is_ip,
            tld_com, tld_org, tld_net, tld_edu, tld_gov, tld_xyz, tld_top, tld_ru, tld_cn, tld_zip, tld_info,
            brand_keyword_count
        ]
        
        return {
            'Protocol': protocol,
            'DomainLength': domain_length,
            'URLLength': url_length,
            'Subdomains': subdomains,
            'SpecialCharCount': special_char_count,
            'IsIP': is_ip,
            'TLD_.com': tld_com,
            'TLD_.org': tld_org,
            'TLD_.net': tld_net,
            'TLD_.edu': tld_edu,
            'TLD_.gov': tld_gov,
            'TLD_.xyz': tld_xyz,
            'TLD_.top': tld_top,
            'TLD_.ru': tld_ru,
            'TLD_.cn': tld_cn,
            'TLD_.zip': tld_zip,
            'TLD_.info': tld_info,
            'BrandKeywords': brand_keyword_count,
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
            
            # Convert to readable format (0 = safe, 1 = unsafe)
            is_safe = prediction == 0
            confidence = max(probabilities) * 100
            risk_score = probabilities[1] * 100  # Probability of being malicious
            
            # Determine risk level
            if risk_score >= 70:
                risk_level = 'high'
            elif risk_score >= 40:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            return {
                'url': url,
                'prediction': 'benign' if is_safe else 'malicious',
                'is_safe': is_safe,
                'confidence': round(confidence, 2),
                'risk_score': round(risk_score, 2),
                'risk_level': risk_level,
                'features': {
                    'Protocol': feature_data['Protocol'],
                    'DomainLength': feature_data['DomainLength'],
                    'URLLength': feature_data['URLLength'],
                    'Subdomains': feature_data['Subdomains'],
                    'SpecialCharCount': feature_data['SpecialCharCount'],
                    'IsIP': feature_data['IsIP'],
                    'TLD_.com': feature_data['TLD_.com'],
                    'BrandKeywords': feature_data['BrandKeywords']
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