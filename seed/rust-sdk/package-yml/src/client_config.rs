use std::collections::HashMap;
use std::time::Duration;

/// Configuration for the API client
#[derive(Debug, Clone)]
pub struct ClientConfig {
    pub base_url: String,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub timeout: Duration,
    pub max_retries: u32,
    pub custom_headers: HashMap<String, String>,
    pub user_agent: String,
}

impl Default for ClientConfig {
    fn default() -> Self {
        Self {
            base_url: String::new(),
            api_key: None,
            bearer_token: None,
            username: None,
            password: None,
            timeout: Duration::from_secs(60),
            max_retries: 3,
            custom_headers: HashMap::new(),
            user_agent: "Fern-Rust-SDK/1.0".to_string(),
        }
    }
}

impl ClientConfig {
    /// Create configuration from environment variables
    pub fn from_env() -> Self {
        let mut config = Self::default();
        
        if let Ok(api_key) = std::env::var("API_KEY") {
            config.api_key = Some(api_key);
        }
        
        if let Ok(bearer_token) = std::env::var("BEARER_TOKEN") {
            config.bearer_token = Some(bearer_token);
        }
        
        if let Ok(base_url) = std::env::var("BASE_URL") {
            config.base_url = base_url;
        }
        
        if let Ok(timeout) = std::env::var("REQUEST_TIMEOUT") {
            if let Ok(seconds) = timeout.parse::<u64>() {
                config.timeout = Duration::from_secs(seconds);
            }
        }
        
        config
    }
    
    /// Validate configuration
    pub fn validate(&self) -> Result<(), String> {
        if self.base_url.is_empty() {
            return Err("base_url is required".to_string());
        }
        
        if !self.base_url.starts_with("http://") && !self.base_url.starts_with("https://") {
            return Err("base_url must start with http:// or https://".to_string());
        }
        
        if self.timeout.as_secs() == 0 {
            return Err("timeout must be greater than 0".to_string());
        }
        
        Ok(())
    }
}