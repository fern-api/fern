use crate::api::resources::UnknownClient;
use crate::{ApiError, ClientConfig};
use std::collections::HashMap;
use std::time::Duration;
/// Builder for creating API clients with custom configuration
pub struct ApiClientBuilder {
    config: ClientConfig,
}
impl Default for ApiClientBuilder {
    fn default() -> Self {
        Self {
            config: ClientConfig::default(),
        }
    }
}
impl ApiClientBuilder {
    /// Create a new builder with the specified base URL
    pub fn new(base_url: impl Into<String>) -> Self {
        let mut config = ClientConfig::default();
        config.base_url = base_url.into();
        Self { config }
    }

    /// Set the API key for authentication
    pub fn api_key(mut self, key: impl Into<String>) -> Self {
        self.config.api_key = Some(key.into());
        self
    }

    /// Set the bearer token for authentication
    pub fn token(mut self, token: impl Into<String>) -> Self {
        self.config.token = Some(token.into());
        self
    }

    /// Set the username for basic authentication
    pub fn username(mut self, username: impl Into<String>) -> Self {
        self.config.username = Some(username.into());
        self
    }

    /// Set the password for basic authentication
    pub fn password(mut self, password: impl Into<String>) -> Self {
        self.config.password = Some(password.into());
        self
    }

    /// Set the OAuth client ID for client credentials authentication
    pub fn client_id(mut self, client_id: impl Into<String>) -> Self {
        self.config.client_id = Some(client_id.into());
        self
    }

    /// Set the OAuth client secret for client credentials authentication
    pub fn client_secret(mut self, client_secret: impl Into<String>) -> Self {
        self.config.client_secret = Some(client_secret.into());
        self
    }

    /// Set OAuth credentials (client_id and client_secret) for client credentials authentication
    pub fn oauth_credentials(
        mut self,
        client_id: impl Into<String>,
        client_secret: impl Into<String>,
    ) -> Self {
        self.config.client_id = Some(client_id.into());
        self.config.client_secret = Some(client_secret.into());
        self
    }

    /// Set the request timeout
    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.config.timeout = timeout;
        self
    }

    /// Set the maximum number of retries
    pub fn max_retries(mut self, retries: u32) -> Self {
        self.config.max_retries = retries;
        self
    }

    /// Add a custom header
    pub fn custom_header(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.config.custom_headers.insert(key.into(), value.into());
        self
    }

    /// Add multiple custom headers
    pub fn custom_headers(mut self, headers: HashMap<String, String>) -> Self {
        self.config.custom_headers.extend(headers);
        self
    }

    /// Set the user agent
    pub fn user_agent(mut self, user_agent: impl Into<String>) -> Self {
        self.config.user_agent = user_agent.into();
        self
    }

    /// Build the client with validation
    pub fn build(self) -> Result<UnknownClient, ApiError> {
        UnknownClient::new(self.config)
    }
}
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_sets_base_url() {
        let builder = ApiClientBuilder::new("https://api.example.com");
        assert_eq!(builder.config.base_url, "https://api.example.com");
    }

    #[test]
    fn test_api_key() {
        let builder = ApiClientBuilder::new("https://api.example.com").api_key("my-key");
        assert_eq!(builder.config.api_key, Some("my-key".to_string()));
    }

    #[test]
    fn test_token() {
        let builder = ApiClientBuilder::new("https://api.example.com").token("my-token");
        assert_eq!(builder.config.token, Some("my-token".to_string()));
    }

    #[test]
    fn test_username() {
        let builder = ApiClientBuilder::new("https://api.example.com").username("user");
        assert_eq!(builder.config.username, Some("user".to_string()));
    }

    #[test]
    fn test_password() {
        let builder = ApiClientBuilder::new("https://api.example.com").password("pass");
        assert_eq!(builder.config.password, Some("pass".to_string()));
    }

    #[test]
    fn test_client_id() {
        let builder = ApiClientBuilder::new("https://api.example.com").client_id("cid");
        assert_eq!(builder.config.client_id, Some("cid".to_string()));
    }

    #[test]
    fn test_client_secret() {
        let builder = ApiClientBuilder::new("https://api.example.com").client_secret("secret");
        assert_eq!(builder.config.client_secret, Some("secret".to_string()));
    }

    #[test]
    fn test_oauth_credentials() {
        let builder =
            ApiClientBuilder::new("https://api.example.com").oauth_credentials("cid", "secret");
        assert_eq!(builder.config.client_id, Some("cid".to_string()));
        assert_eq!(builder.config.client_secret, Some("secret".to_string()));
    }

    #[test]
    fn test_timeout() {
        let builder =
            ApiClientBuilder::new("https://api.example.com").timeout(Duration::from_secs(120));
        assert_eq!(builder.config.timeout, Duration::from_secs(120));
    }

    #[test]
    fn test_max_retries() {
        let builder = ApiClientBuilder::new("https://api.example.com").max_retries(5);
        assert_eq!(builder.config.max_retries, 5);
    }

    #[test]
    fn test_custom_header() {
        let builder =
            ApiClientBuilder::new("https://api.example.com").custom_header("X-Custom", "value");
        assert_eq!(
            builder.config.custom_headers.get("X-Custom"),
            Some(&"value".to_string())
        );
    }

    #[test]
    fn test_custom_headers_multiple() {
        let mut headers = HashMap::new();
        headers.insert("X-One".to_string(), "1".to_string());
        headers.insert("X-Two".to_string(), "2".to_string());
        let builder = ApiClientBuilder::new("https://api.example.com").custom_headers(headers);
        assert_eq!(
            builder.config.custom_headers.get("X-One"),
            Some(&"1".to_string())
        );
        assert_eq!(
            builder.config.custom_headers.get("X-Two"),
            Some(&"2".to_string())
        );
    }

    #[test]
    fn test_user_agent() {
        let builder = ApiClientBuilder::new("https://api.example.com").user_agent("my-sdk/1.0");
        assert_eq!(builder.config.user_agent, "my-sdk/1.0");
    }

    #[test]
    fn test_full_builder_chain() {
        let builder = ApiClientBuilder::new("https://api.example.com")
            .api_key("key")
            .token("tok")
            .username("user")
            .password("pass")
            .timeout(Duration::from_secs(60))
            .max_retries(3)
            .custom_header("X-Foo", "bar")
            .user_agent("test/1.0");
        assert_eq!(builder.config.base_url, "https://api.example.com");
        assert_eq!(builder.config.api_key, Some("key".to_string()));
        assert_eq!(builder.config.token, Some("tok".to_string()));
        assert_eq!(builder.config.username, Some("user".to_string()));
        assert_eq!(builder.config.password, Some("pass".to_string()));
        assert_eq!(builder.config.timeout, Duration::from_secs(60));
        assert_eq!(builder.config.max_retries, 3);
        assert_eq!(builder.config.user_agent, "test/1.0");
    }

    #[test]
    fn test_build_succeeds() {
        let result = ApiClientBuilder::new("https://api.example.com").build();
        assert!(result.is_ok());
    }
}
