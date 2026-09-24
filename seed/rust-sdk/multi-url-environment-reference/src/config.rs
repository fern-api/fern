use crate::Environment;
use std::collections::HashMap;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct ClientConfig {
    /// An explicit URL for every request. Left at its default, requests route per
    /// service through `environment`; see `service_url`.
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
    /// The environment whose URLs requests go to, per service, unless `base_url` was
    /// set explicitly; see `service_url`.
    pub environment: Option<Environment>,
}
impl Default for ClientConfig {
    fn default() -> Self {
        Self {
            base_url: Environment::default().url().to_string(),
            api_key: None,
            token: None,
            username: None,
            password: None,
            client_id: None,
            client_secret: None,
            oauth_token_endpoint: None,
            oauth_token_exchange: None,
            timeout: Duration::from_secs(60),
            max_retries: 3,
            custom_headers: HashMap::from([
                ("X-Fern-Language".to_string(), "Rust".to_string()),
                ("X-Fern-SDK-Name".to_string(), "seed_api".to_string()),
                ("X-Fern-SDK-Version".to_string(), "0.0.1".to_string()),
            ]),
            user_agent: "Api Rust SDK".to_string(),
            reqwest_client: None,
            environment: Some(Environment::default()),
        }
    }
}
impl ClientConfig {
    /// Resolves the URL a request goes to.
    ///
    /// An explicit `base_url` wins: when it is anything other than one of the configured
    /// `environment`'s URLs (or the default environment's URL that `Default` fills in),
    /// every request goes there. Otherwise the request goes to the environment's URL for its
    /// service, which `url_for` picks (`|environment| environment.<service>_url()`).
    pub fn service_url<'a>(&'a self, url_for: impl FnOnce(&'a Environment) -> &'a str) -> &'a str {
        match &self.environment {
            Some(environment) if !self.overrides_environment(environment) => url_for(environment),
            _ => &self.base_url,
        }
    }

    fn overrides_environment(&self, environment: &Environment) -> bool {
        let default_environment = Environment::default();
        !self.base_url.is_empty()
            && ![
                environment.base_url(),
                environment.auth_url(),
                environment.upload_url(),
                default_environment.url(),
            ]
            .contains(&self.base_url.as_str())
    }
}
