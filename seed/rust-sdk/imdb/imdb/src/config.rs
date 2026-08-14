use std::collections::HashMap;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct ClientConfig {
    pub base_url: String,
    pub api_key: Option<String>,
    pub token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub client_id: Option<String>,
    pub client_secret: Option<String>,
    pub oauth_token_endpoint: Option<String>,
    pub oauth_token_exchange: Option<crate::OAuthTokenExchangeConfig>,
    pub timeout: Duration,
    pub max_retries: u32,
    pub custom_headers: HashMap<String, String>,
    pub user_agent: String,
    /// Optional custom `reqwest` client, used as-is for every request.
    /// When set, it owns all transport-level configuration (TLS, proxies, timeout,
    /// user agent); when `None` the SDK builds its own client from `timeout` and
    /// `user_agent`.
    pub reqwest_client: Option<reqwest::Client>,
}
impl Default for ClientConfig {
    fn default() -> Self {
        Self {
            base_url: String::new(),
            api_key: None,
            token: None,
            username: None,
            password: None,
            client_id: None,
            client_secret: None,
            oauth_token_endpoint: None,
            oauth_token_exchange: None,
            timeout: Duration::from_secs(60),
            max_retries: 5,
            custom_headers: HashMap::from([
                ("X-Fern-Language".to_string(), "Rust".to_string()),
                ("X-Fern-SDK-Name".to_string(), "seed_api".to_string()),
                ("X-Fern-SDK-Version".to_string(), "0.0.1".to_string()),
            ]),
            user_agent: "Api Rust SDK".to_string(),
            reqwest_client: None,
        }
    }
}
