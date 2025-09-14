"""
SafeLink Streamlit App
A simple web interface for URL scanning using the trained ML model
"""
import streamlit as st
import sys
import os

# Add the Backend directory to Python path so we can import Scanner modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from Scanner.url_scanner import scan_url, get_scanner_status
    SCANNER_LOADED = True
except ImportError as e:
    st.error(f"❌ Could not import URL scanner: {e}")
    SCANNER_LOADED = False

# Page configuration
st.set_page_config(
    page_title="SafeLink - URL Scanner",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Main title
st.title("🔍 SafeLink - URL Security Scanner")
st.markdown("### Analyze URLs for potential security threats using Machine Learning")

# Sidebar with model status
with st.sidebar:
    st.header("🤖 Model Status")
    
    if not SCANNER_LOADED:
        st.error("❌ Scanner module not loaded")
        st.warning("Make sure you're running from the Backend directory")
    else:
        # Check model status
        try:
            status = get_scanner_status()
            if status['model_loaded']:
                st.success("✅ ML Model Loaded")
            else:
                st.error("❌ ML Model Not Found")
                st.warning("Please run the LogisticRegression_Algorithm.ipynb notebook first to train the model.")
            
            if status['scaler_loaded']:
                st.success("✅ Feature Scaler Loaded")
            else:
                st.error("❌ Feature Scaler Not Found")
                
            # Model files status
            st.subheader("📁 Model Files")
            for file, exists in status['model_files'].items():
                if exists:
                    st.success(f"✅ {file}")
                else:
                    st.error(f"❌ {file}")
                    
        except Exception as e:
            st.error(f"❌ Error loading model status: {e}")

# Main content area
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("🌐 Enter URL to Scan")
    
    # URL input
    url_input = st.text_input(
        "URL:",
        placeholder="https://example.com or http://suspicious-site.com",
        help="Enter any URL to analyze its safety"
    )
    
    # Scan button
    if st.button("🔍 Scan URL", type="primary", use_container_width=True):
        if not SCANNER_LOADED:
            st.error("❌ Scanner not available. Please check the import errors above.")
        elif url_input.strip():
            with st.spinner("🤖 Analyzing URL with ML model..."):
                try:
                    # Scan the URL
                    result = scan_url(url_input.strip())
                    
                    if 'error' in result:
                        st.error(f"❌ Error: {result['error']}")
                    else:
                        # Display results
                        st.success("✅ Analysis Complete!")
                        
                        # Risk level color coding
                        if result['risk_level'] == 'high':
                            risk_color = "red"
                            risk_icon = "🚨"
                        elif result['risk_level'] == 'medium':
                            risk_color = "orange"
                            risk_icon = "⚠️"
                        else:
                            risk_color = "green"
                            risk_icon = "✅"
                        
                        # Main results
                        st.markdown("---")
                        st.subheader("📊 Analysis Results")
                        
                        col_result1, col_result2, col_result3 = st.columns(3)
                        
                        with col_result1:
                            st.metric(
                                label="🎯 Prediction",
                                value=result['prediction'].upper(),
                                delta=f"{risk_icon} {result['risk_level'].upper()}"
                            )
                        
                        with col_result2:
                            st.metric(
                                label="📈 Risk Score",
                                value=f"{result['risk_score']}%",
                                delta=f"Confidence: {result['confidence']}%"
                            )
                        
                        with col_result3:
                            st.metric(
                                label="🛡️ Safety Status",
                                value="SAFE" if result['is_safe'] else "UNSAFE",
                                delta=result['model_used']
                            )
                        
                        # URL Details
                        st.markdown("---")
                        st.subheader("🔗 URL Details")
                        st.write(f"**Full URL:** {result['url']}")
                        st.write(f"**Domain:** {result['domain']}")
                        
                        # Features analysis
                        st.markdown("---")
                        st.subheader("🔍 Feature Analysis")
                        
                        features = result['features']
                        
                        feat_col1, feat_col2 = st.columns(2)
                        
                        with feat_col1:
                            st.write(f"**Protocol:** {'HTTPS' if features['Protocol'] else 'HTTP'}")
                            st.write(f"**Domain Length:** {features['DomainLength']} characters")
                            st.write(f"**URL Length:** {features['URLLength']} characters")
                        
                        with feat_col2:
                            st.write(f"**Special Characters:** {features['SpecialCharCount']}")
                            st.write(f"**Is IP Address:** {'Yes' if features['IsIP'] else 'No'}")
                            st.write(f"**Entropy:** {features['Entropy']}")
                        
                        # Recommendation
                        st.markdown("---")
                        st.subheader("💡 Recommendation")
                        
                        if result['is_safe']:
                            st.success("✅ This URL appears to be safe to visit based on our analysis.")
                        else:
                            st.error("⚠️ **Caution advised!** This URL shows suspicious characteristics. Consider additional verification before visiting.")
                            
                except Exception as e:
                    st.error(f"❌ Unexpected error: {str(e)}")
        else:
            st.warning("⚠️ Please enter a URL to scan.")

# Example URLs section
with col2:
    st.subheader("🧪 Test Examples")
    st.markdown("Try these sample URLs:")
    
    examples = [
        ("https://www.google.com", "Safe example"),
        ("http://malicious.tk/login", "Suspicious example"),
        ("https://github.com", "Safe example"),
        ("http://192.168.1.1/admin", "IP-based URL"),
    ]
    
    for url, description in examples:
        if st.button(f"📝 {description}", key=url, use_container_width=True):
            st.code(url, language="text")
            st.info("👆 Copy this URL to test!")
    
    # Auto-fill example URL if selected
    if 'example_url' in st.session_state:
        st.info(f"💡 Example selected: {st.session_state['example_url']}")
        st.markdown("Copy this URL to the input box above to test.")

# Footer
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center; color: gray;'>
        <p>🔐 SafeLink URL Scanner | Powered by Machine Learning</p>
        <p>Built with Streamlit & Scikit-learn</p>
    </div>
    """,
    unsafe_allow_html=True
)