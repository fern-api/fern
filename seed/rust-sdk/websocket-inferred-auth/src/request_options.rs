use std::collections::HashMap;

/// Options for customizing individual requests
#[derive(Debug, Clone, Default)]
pub struct RequestOptions {
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub max_retries: Option<u32>,
    pub additional_headers: HashMap<String, String>,
}

impl RequestOptions {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn api_key(mut self, key: impl Into<String>) -> Self {
        self.api_key = Some(key.into());
        self
    }

    pub fn bearer_token(mut self, token: impl Into<String>) -> Self {
        self.bearer_token = Some(token.into());
        self
    }

    pub fn max_retries(mut self, retries: u32) -> Self {
        self.max_retries = Some(retries);
        self
    }

    pub fn additional_header(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.additional_headers.insert(key.into(), value.into());
        self
    }
}
