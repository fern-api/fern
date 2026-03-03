use std::collections::HashMap;
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_has_no_values() {
        let opts = RequestOptions::default();
        assert!(opts.api_key.is_none());
        assert!(opts.token.is_none());
        assert!(opts.max_retries.is_none());
        assert!(opts.timeout_seconds.is_none());
        assert!(opts.additional_headers.is_empty());
        assert!(opts.additional_query_params.is_empty());
    }

    #[test]
    fn test_new_equals_default() {
        let opts = RequestOptions::new();
        assert!(opts.api_key.is_none());
        assert!(opts.token.is_none());
        assert!(opts.max_retries.is_none());
        assert!(opts.timeout_seconds.is_none());
        assert!(opts.additional_headers.is_empty());
        assert!(opts.additional_query_params.is_empty());
    }

    #[test]
    fn test_api_key() {
        let opts = RequestOptions::new().api_key("my-key");
        assert_eq!(opts.api_key, Some("my-key".to_string()));
    }

    #[test]
    fn test_token() {
        let opts = RequestOptions::new().token("my-token");
        assert_eq!(opts.token, Some("my-token".to_string()));
    }

    #[test]
    fn test_max_retries() {
        let opts = RequestOptions::new().max_retries(3);
        assert_eq!(opts.max_retries, Some(3));
    }

    #[test]
    fn test_timeout_seconds() {
        let opts = RequestOptions::new().timeout_seconds(30);
        assert_eq!(opts.timeout_seconds, Some(30));
    }

    #[test]
    fn test_additional_header() {
        let opts = RequestOptions::new().additional_header("X-Custom", "value");
        assert_eq!(
            opts.additional_headers.get("X-Custom"),
            Some(&"value".to_string())
        );
    }

    #[test]
    fn test_additional_headers_accumulate() {
        let opts = RequestOptions::new()
            .additional_header("X-First", "1")
            .additional_header("X-Second", "2");
        assert_eq!(opts.additional_headers.len(), 2);
        assert_eq!(
            opts.additional_headers.get("X-First"),
            Some(&"1".to_string())
        );
        assert_eq!(
            opts.additional_headers.get("X-Second"),
            Some(&"2".to_string())
        );
    }

    #[test]
    fn test_additional_query_param() {
        let opts = RequestOptions::new().additional_query_param("page", "1");
        assert_eq!(
            opts.additional_query_params.get("page"),
            Some(&"1".to_string())
        );
    }

    #[test]
    fn test_additional_query_params_accumulate() {
        let opts = RequestOptions::new()
            .additional_query_param("page", "1")
            .additional_query_param("limit", "10");
        assert_eq!(opts.additional_query_params.len(), 2);
        assert_eq!(
            opts.additional_query_params.get("page"),
            Some(&"1".to_string())
        );
        assert_eq!(
            opts.additional_query_params.get("limit"),
            Some(&"10".to_string())
        );
    }

    #[test]
    fn test_full_method_chaining() {
        let opts = RequestOptions::new()
            .api_key("key")
            .token("tok")
            .max_retries(5)
            .timeout_seconds(60)
            .additional_header("X-Foo", "bar")
            .additional_query_param("q", "search");
        assert_eq!(opts.api_key, Some("key".to_string()));
        assert_eq!(opts.token, Some("tok".to_string()));
        assert_eq!(opts.max_retries, Some(5));
        assert_eq!(opts.timeout_seconds, Some(60));
        assert_eq!(opts.additional_headers.len(), 1);
        assert_eq!(opts.additional_query_params.len(), 1);
    }
}
