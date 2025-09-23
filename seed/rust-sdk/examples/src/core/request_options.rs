use std::collections::HashMap;
use std::time::Duration;

/// Options for customizing individual requests
#[derive(Debug, Clone, Default)]
pub struct RequestOptions {
    /// API key for authentication (overrides client-level API key)
    pub api_key: Option<String>,
    /// Bearer token for authentication (overrides client-level token)
    pub token: Option<String>,
    /// Maximum number of retry attempts for failed requests
    pub max_retries: Option<u32>,
    /// Request timeout in seconds (overrides client-level timeout)
    pub timeout_seconds: Option<u64>,
    /// Additional headers to include in the request
    pub additional_headers: HashMap<String, String>,
    /// Additional query parameters to include in the request
    pub additional_query_params: HashMap<String, String>,
}

impl RequestOptions {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn api_key(mut self, key: impl Into<String>) -> Self {
        self.api_key = Some(key.into());
        self
    }

    pub fn token(mut self, token: impl Into<String>) -> Self {
        self.token = Some(token.into());
        self
    }

    pub fn max_retries(mut self, retries: u32) -> Self {
        self.max_retries = Some(retries);
        self
    }

    pub fn timeout_seconds(mut self, timeout: u64) -> Self {
        self.timeout_seconds = Some(timeout);
        self
    }

    pub fn additional_header(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.additional_headers.insert(key.into(), value.into());
        self
    }

    pub fn additional_query_param(
        mut self,
        key: impl Into<String>,
        value: impl Into<String>,
    ) -> Self {
        self.additional_query_params
            .insert(key.into(), value.into());
        self
    }
}
