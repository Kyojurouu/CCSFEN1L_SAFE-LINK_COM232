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
            # Try to load Model 3 first (enhanced), fall back to v2 if not available
            model_path = os.path.join(self.model_dir, 'logistic_model_v3.pkl')
            scaler_path = os.path.join(self.model_dir, 'scaler_v3.pkl')
            encoder_path = os.path.join(self.model_dir, 'label_encoder_v3.pkl')
            features_path = os.path.join(self.model_dir, 'feature_names_v3.pkl')
            
            # Fall back to v2 if v3 doesn't exist
            if not os.path.exists(model_path):
                model_path = os.path.join(self.model_dir, 'logistic_model_v2.pkl')
                scaler_path = os.path.join(self.model_dir, 'scaler_v2.pkl')
                encoder_path = os.path.join(self.model_dir, 'label_encoder_v2.pkl')
                features_path = None
            
            self.model_version = "v3" if "v3" in model_path else "v2"
            self.feature_names = None
            
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print(f"✅ URL Scanner: Model {self.model_version} loaded successfully")
            
            if os.path.exists(scaler_path):
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                print("✅ URL Scanner: Scaler loaded successfully")
                
            if os.path.exists(encoder_path):
                with open(encoder_path, 'rb') as f:
                    self.label_encoder = pickle.load(f)
                print("✅ URL Scanner: Label encoder loaded successfully")
            
            # Load feature names for v3
            if features_path and os.path.exists(features_path):
                with open(features_path, 'rb') as f:
                    self.feature_names = pickle.load(f)
                print("✅ URL Scanner: Feature names loaded successfully")
                
        except Exception as e:
            print(f"❌ URL Scanner: Error loading model - {e}")
    
    def extract_features(self, url):
        """Extract features from URL - supports both v2 and v3 models"""
        try:
            parsed = urlparse(url)
        except:
            parsed = None

        # Basic features (common to both models)
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
        has_http = 1 if parsed and parsed.scheme == "http" else 0

        if hasattr(self, 'model_version') and self.model_version == "v3":
            # Enhanced features for Model 3
            import re
            
            # Split suspicious keywords
            phishing_keywords = ["login", "secure", "verify", "account", "bank", "paypal", "update"]
            marketing_keywords = ["free", "win", "prize", "offer", "deal"]
            
            has_phishing_kw = 1 if any(kw in url.lower() for kw in phishing_keywords) else 0
            has_marketing_kw = 1 if any(kw in url.lower() for kw in marketing_keywords) else 0

            # Domain reputation features
            domain_parts = hostname.split('.')
            main_domain = domain_parts[0] if domain_parts else ""
            
            # TLD analysis
            suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.pw']
            has_suspicious_tld = 1 if any(hostname.endswith(tld) for tld in suspicious_tlds) else 0
            
            legitimate_tlds = ['.com', '.org', '.net', '.edu', '.gov', '.mil']
            has_legitimate_tld = 1 if any(hostname.endswith(tld) for tld in legitimate_tlds) else 0
            
            # Domain structure analysis
            domain_looks_established = 1 if (len(main_domain) >= 4 and 
                                           not re.match(r'^[0-9]+$', main_domain) and
                                           len(domain_parts) >= 2) else 0
            
            # URL shortener detection
            url_shorteners = ['bit.ly', 'tinyurl.com', 'ow.ly', 't.co', 'goo.gl']
            is_url_shortener = 1 if any(shortener in hostname for shortener in url_shorteners) else 0
            
            # Additional features
            num_subdomains = len(domain_parts) - 2 if len(domain_parts) > 2 else 0
            is_ip_address = 1 if re.match(r'^\d+\.\d+\.\d+\.\d+', hostname) else 0
            
            feature_array = [
                url_length, num_dots, num_hyphens, num_at, num_digits,
                num_params, num_slashes, num_question, num_percent, num_special,
                domain_length, path_length, has_http,
                has_phishing_kw, has_marketing_kw,
                has_suspicious_tld, has_legitimate_tld, domain_looks_established,
                is_url_shortener, num_subdomains, is_ip_address
            ]
            
            feature_dict = {
                'url_length': url_length, 'num_dots': num_dots, 'num_hyphens': num_hyphens,
                'num_at': num_at, 'num_digits': num_digits, 'num_params': num_params,
                'num_slashes': num_slashes, 'num_question': num_question, 'num_percent': num_percent,
                'num_special': num_special, 'domain_length': domain_length, 'path_length': path_length,
                'has_http': has_http, 'has_phishing_kw': has_phishing_kw, 'has_marketing_kw': has_marketing_kw,
                'has_suspicious_tld': has_suspicious_tld, 'has_legitimate_tld': has_legitimate_tld,
                'domain_looks_established': domain_looks_established, 'is_url_shortener': is_url_shortener,
                'num_subdomains': num_subdomains, 'is_ip_address': is_ip_address,
                'feature_array': feature_array
            }
        else:
            # Legacy features for Model 2
            keywords = ["login", "secure", "update", "free", "verify", "bank", "account", "paypal"]
            has_suspicious_kw = 1 if any(kw in url.lower() for kw in keywords) else 0

            feature_array = [
                url_length, num_dots, num_hyphens, num_at, num_digits,
                num_params, num_slashes, num_question, num_percent, num_special,
                domain_length, path_length, has_http, has_suspicious_kw
            ]
            
            feature_dict = {
                'url_length': url_length, 'num_dots': num_dots, 'num_hyphens': num_hyphens,
                'num_at': num_at, 'num_digits': num_digits, 'num_params': num_params,
                'num_slashes': num_slashes, 'num_question': num_question, 'num_percent': num_percent,
                'num_special': num_special, 'domain_length': domain_length, 'path_length': path_length,
                'has_http': has_http, 'has_suspicious_kw': has_suspicious_kw,
                'feature_array': feature_array
            }
        
        return feature_dict
    
    def check_domain_reputation(self, domain):
        """Check domain reputation using various indicators"""
        try:
            # Method 1: Check if domain has SSL certificate (HTTPS support)
            import ssl
            import socket
            
            # Method 2: Check domain age and registration info
            # Method 3: Check against known malicious patterns
            
            # Simple heuristics for now - be more conservative
            suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.pw']  # Removed .info and .biz (too common)
            suspicious_patterns = ['bit.ly', 'tinyurl.com', 'ow.ly', 't.co', 'goo.gl']  # URL shorteners
            
            # Check for suspicious TLD
            is_suspicious_tld = any(domain.endswith(tld) for tld in suspicious_tlds)
            
            # Check for URL shorteners (these need special handling)
            is_url_shortener = any(pattern in domain for pattern in suspicious_patterns)
            
            # Check domain length (very short domains can be suspicious) - be more lenient
            main_domain_part = domain.split('.')[0].replace('www', '') if domain.startswith('www.') else domain.split('.')[0]
            is_short_domain = len(main_domain_part) < 3  # Changed from 4 to 3
            
            # Check for numbers in domain (common in malicious domains) - be more strict
            main_domain = domain.split('.')[0]
            has_many_numbers = sum(c.isdigit() for c in main_domain) > len(main_domain) * 0.5  # Changed from 0.3 to 0.5
            
            return {
                'is_suspicious_tld': is_suspicious_tld,
                'is_url_shortener': is_url_shortener,
                'is_short_domain': is_short_domain,
                'has_many_numbers': has_many_numbers,
                'reputation_score': 0  # Could integrate with external APIs later
            }
        except Exception as e:
            return {
                'is_suspicious_tld': False,
                'is_url_shortener': False,
                'is_short_domain': False,
                'has_many_numbers': False,
                'reputation_score': 0
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
            
            domain = urlparse(url).netloc.lower()
            
            if hasattr(self, 'model_version') and self.model_version == "v3":
                # HYBRID APPROACH: Rule-based + ML for better accuracy
                # The training data has quality issues, so we use rules to override obvious cases
                
                # Rule-based overrides for clearly legitimate domains
                major_legitimate_domains = [
                    'google.com', 'facebook.com', 'messenger.com', 'github.com', 'microsoft.com', 'amazon.com',
                    'apple.com', 'twitter.com', 'x.com', 'instagram.com', 'linkedin.com', 'canva.com',
                    'youtube.com', 'reddit.com', 'stackoverflow.com', 'wikipedia.org',
                    'netflix.com', 'spotify.com', 'discord.com', 'twitch.tv', 'steam.com',
                    'epicgames.com', 'riot.com', 'blizzard.com', 'ea.com', 'ubisoft.com', 'riotgames.com', 'roblox.com'
                ]
                
                is_major_legitimate = any(legit_domain in domain for legit_domain in major_legitimate_domains)
                
                # Rule-based overrides for clearly suspicious patterns
                suspicious_indicators = [
                    domain.endswith('.tk'), domain.endswith('.ml'), domain.endswith('.ga'), 
                    domain.endswith('.cf'), domain.endswith('.pw'),
                    len([c for c in domain if c.isdigit()]) > len(domain.replace('.', '')) * 0.4,  # Too many numbers
                    '@' in url, 'bit.ly' in domain, 'tinyurl.com' in domain  # Clear red flags
                ]
                
                is_clearly_suspicious = any(suspicious_indicators)
                
                if is_major_legitimate:
                    # Override: Major legitimate domains are always safe
                    is_safe = True
                    prediction_text = 'benign'
                    risk_level = 'low'
                    adjusted_risk_score = min(risk_score * 0.3, 25)  # Cap at 25% for major domains
                    reputation_adjustment = -(risk_score * 0.7)  # Show the adjustment made
                    
                elif is_clearly_suspicious:
                    # Use ML prediction but ensure it's flagged as risky
                    adjusted_risk_score = max(risk_score, 70)  # Minimum 70% for clearly suspicious
                    reputation_adjustment = max(0, 70 - risk_score)
                    
                    if adjusted_risk_score >= 70:
                        is_safe = False
                        prediction_text = 'malicious'
                        risk_level = 'high'
                    else:
                        is_safe = False
                        prediction_text = 'medium risk'
                        risk_level = 'medium'
                        
                else:
                    # Use ML model with minor adjustments for other cases
                    domain_rep = self.check_domain_reputation(domain)
                    reputation_adjustment = 0
                    
                    # Small bonus for clearly legitimate patterns
                    if any(pattern in domain for pattern in ['.edu', '.gov', '.mil', '.org']):
                        reputation_adjustment -= 15
                    
                    # Small bonus for well-formed domains
                    if (len(domain.split('.')[0]) >= 4 and 
                        domain.count('.') >= 1 and 
                        not any(char.isdigit() for char in domain.split('.')[0][:3])):
                        reputation_adjustment -= 10
                    
                    adjusted_risk_score = max(0, min(100, risk_score + reputation_adjustment))
                    
                    # Classification based on adjusted score
                    if adjusted_risk_score < 35:
                        is_safe = True
                        prediction_text = 'benign'
                        risk_level = 'low'
                    elif 35 <= adjusted_risk_score < 65:
                        is_safe = False
                        prediction_text = 'medium risk'
                        risk_level = 'medium'
                    else:
                        is_safe = False
                        prediction_text = 'malicious'
                        risk_level = 'high'
                
                # Handle URL shorteners
                if 'is_url_shortener' in feature_data and feature_data['is_url_shortener'] == 1:
                    prediction_text = 'url_shortener'
                    risk_level = 'medium'
                    is_safe = False
                    
            else:
                # Legacy Model 2 - needs more aggressive reputation adjustments
                domain_rep = self.check_domain_reputation(domain)
                reputation_adjustment = 0
                
                # Check for well-established domain patterns
                main_domain = domain.split('.')[0] if '.' in domain else domain
                
                # Reduce risk for legitimate patterns
                if (not domain_rep['is_suspicious_tld'] and 
                    not domain_rep['is_short_domain'] and 
                    not domain_rep['has_many_numbers'] and
                    len(main_domain) >= 4):
                    reputation_adjustment -= 35
                
                # Additional reduction for common legitimate patterns
                if any(pattern in domain for pattern in ['www.', '.com', '.org', '.net', '.edu', '.gov']):
                    reputation_adjustment -= 15
                
                # Extra bonus for well-known patterns
                major_domains = ['google', 'facebook', 'github', 'microsoft', 'amazon', 'apple', 'twitter', 'instagram', 'linkedin', 'youtube', 'reddit', 'stackoverflow', 'wikipedia']
                if any(pattern in domain for pattern in major_domains):
                    reputation_adjustment -= 40
                
                # Only increase risk for clearly suspicious patterns
                if domain_rep['is_suspicious_tld']:
                    reputation_adjustment += 30
                if domain_rep['has_many_numbers'] and domain_rep['is_short_domain']:
                    reputation_adjustment += 20
                
                # Special handling for URL shorteners
                if domain_rep['is_url_shortener']:
                    reputation_adjustment = 5
                    
                # Apply reputation adjustment
                adjusted_risk_score = max(0, min(100, risk_score + reputation_adjustment))
                
                # Special override for major trusted domains
                is_major_domain = any(pattern in domain for pattern in major_domains)
                
                # Enhanced risk classification with reputation-based adjustments
                if is_major_domain and adjusted_risk_score < 80:
                    is_safe = True
                    prediction_text = 'benign'
                    risk_level = 'low'
                    adjusted_risk_score = min(adjusted_risk_score, 30)
                elif adjusted_risk_score < 35:
                    is_safe = True
                    prediction_text = 'benign'
                    risk_level = 'low'
                elif 35 <= adjusted_risk_score < 70:
                    is_safe = False
                    prediction_text = 'medium risk'
                    risk_level = 'medium'
                else:
                    is_safe = False
                    prediction_text = 'malicious'
                    risk_level = 'high'
                
                # Special case for URL shorteners
                if domain_rep['is_url_shortener']:
                    prediction_text = 'url_shortener'
                    risk_level = 'medium'
                    is_safe = False
            
            return {
                'url': url,
                'prediction': prediction_text,
                'is_safe': is_safe,
                'confidence': round(confidence, 2),
                'risk_score': round(adjusted_risk_score, 2),
                'original_risk_score': round(risk_score, 2),
                'reputation_adjustment': reputation_adjustment,
                'risk_level': risk_level,
                'features': {k: v for k, v in feature_data.items() if k != 'feature_array'},
                'domain': urlparse(url).netloc,
                'domain_reputation': domain_rep if hasattr(self, 'model_version') and self.model_version == "v2" else None,
                'model_used': f'logistic_regression_{self.model_version}' if hasattr(self, 'model_version') else 'logistic_regression'
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
                'logistic_model_v3.pkl': os.path.exists(os.path.join(self.model_dir, 'logistic_model_v3.pkl')),
                'scaler_v3.pkl': os.path.exists(os.path.join(self.model_dir, 'scaler_v3.pkl')),
                'label_encoder_v3.pkl': os.path.exists(os.path.join(self.model_dir, 'label_encoder_v3.pkl'))
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