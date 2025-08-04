use std::collections::HashMap;
use std::time::Duration;
use crate::{ClientConfig, ClientError};
use crate::client::PackageClient;

/// Builder for creating API clients with custom configuration
pub struct ApiClientBuilder {
    config: ClientConfig,
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
    pub fn bearer_token(mut self, token: impl Into<String>) -> Self {
        self.config.bearer_token = Some(token.into());
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
    pub fn build(self) -> Result<PackageClient, ClientError> {  
        // Call the client constructor with all authentication parameters
        PackageClient::new(self.config)
    }
}