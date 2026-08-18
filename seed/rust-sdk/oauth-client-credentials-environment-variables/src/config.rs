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
            oauth_token_endpoint: Some("/token".to_string()),
            oauth_token_exchange: Some(crate::OAuthTokenExchangeConfig {
                client_id_property: "client_id".to_string(),
                client_secret_property: "client_secret".to_string(),
                extra_request_properties: HashMap::from([
                    (
                        "audience".to_string(),
                        "https://api.example.com".to_string(),
                    ),
                    ("grant_type".to_string(), "client_credentials".to_string()),
                ]),
                access_token_property: "access_token".to_string(),
                expires_in_property: "expires_in".to_string(),
                form_encoded: false,
            }),
            timeout: Duration::from_secs(60),
            max_retries: 3,
            custom_headers: HashMap::from([
                ("X-Fern-Language".to_string(), "Rust".to_string()),
                (
                    "X-Fern-SDK-Name".to_string(),
                    "seed_oauth_client_credentials_environment_variables".to_string(),
                ),
                ("X-Fern-SDK-Version".to_string(), "0.0.1".to_string()),
            ]),
            user_agent: "OauthClientCredentialsEnvironmentVariables Rust SDK".to_string(),
            reqwest_client: None,
        }
    }
}
