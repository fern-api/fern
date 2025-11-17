use crate::api::resources::ApiClient;
use crate::{ApiError, ClientConfig};
use std::collections::HashMap;
use std::time::Duration;

/*
Things to know:

`impl Into<String>` is a generic parameter constraint in Rust that means "accept any type that can be converted into a String."
It's essentially Rust's way of saying "I'll take a string in any form you give it to me."

Types that implement Into<String>:

// All of these work:
builder.api_key("hello")           // &str
builder.api_key("hello".to_string()) // String
builder.api_key(format!("key_{}", id)) // String from format!
builder.api_key(my_string_variable)    // String variable
*/

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
    pub fn build(self) -> Result<ApiClient, ApiError> {
        ApiClient::new(self.config)
    }
}
