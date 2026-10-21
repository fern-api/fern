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
    /// Additional properties to merge into the JSON request body.
    ///
    /// Keys are sent verbatim (use the API's wire-format names). See
    /// [`RequestOptions::additional_body_param`] for the merge rules.
    pub additional_body_params: serde_json::Map<String, serde_json::Value>,
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

    /// Adds a property to the request body, e.g. an undocumented or beta field.
    ///
    /// The property is merged into the body after it has been serialized:
    /// - the key is used as-is (no casing transform), and a value set here overrides a
    ///   generated field with the same key;
    /// - if the endpoint sends no body (or a `null` body), a JSON object containing only
    ///   the additional properties is sent;
    /// - it applies to JSON and `application/x-www-form-urlencoded` bodies. Multipart
    ///   (file upload) and raw bytes bodies are not supported and are sent unchanged, as is
    ///   a body that serializes to a non-object JSON value (e.g. an array).
    pub fn additional_body_param(
        mut self,
        key: impl Into<String>,
        value: impl Into<serde_json::Value>,
    ) -> Self {
        self.additional_body_params.insert(key.into(), value.into());
        self
    }

    /// Merges [`RequestOptions::additional_body_params`] into a serialized request body.
    pub(crate) fn merge_additional_body_params(
        &self,
        body: Option<serde_json::Value>,
    ) -> Option<serde_json::Value> {
        if self.additional_body_params.is_empty() {
            return body;
        }
        match body {
            None | Some(serde_json::Value::Null) => Some(serde_json::Value::Object(
                self.additional_body_params.clone(),
            )),
            Some(serde_json::Value::Object(mut map)) => {
                for (key, value) in &self.additional_body_params {
                    map.insert(key.clone(), value.clone());
                }
                Some(serde_json::Value::Object(map))
            }
            other => other,
        }
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
        assert!(opts.additional_body_params.is_empty());
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
        assert!(opts.additional_body_params.is_empty());
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
            .additional_query_param("q", "search")
            .additional_body_param("beta_flag", true);
        assert_eq!(opts.api_key, Some("key".to_string()));
        assert_eq!(opts.token, Some("tok".to_string()));
        assert_eq!(opts.max_retries, Some(5));
        assert_eq!(opts.timeout_seconds, Some(60));
        assert_eq!(opts.additional_headers.len(), 1);
        assert_eq!(opts.additional_query_params.len(), 1);
        assert_eq!(opts.additional_body_params.len(), 1);
    }

    #[test]
    fn test_additional_body_param() {
        let opts = RequestOptions::new().additional_body_param("beta_flag", true);
        assert_eq!(
            opts.additional_body_params.get("beta_flag"),
            Some(&serde_json::json!(true))
        );
    }

    #[test]
    fn test_additional_body_params_accumulate() {
        let opts = RequestOptions::new()
            .additional_body_param("first", "1")
            .additional_body_param("second", 2);
        assert_eq!(opts.additional_body_params.len(), 2);
        assert_eq!(
            opts.additional_body_params.get("first"),
            Some(&serde_json::json!("1"))
        );
        assert_eq!(
            opts.additional_body_params.get("second"),
            Some(&serde_json::json!(2))
        );
    }

    #[test]
    fn test_merge_without_additional_body_params_leaves_body_unchanged() {
        let opts = RequestOptions::new();
        assert_eq!(opts.merge_additional_body_params(None), None);
        assert_eq!(
            opts.merge_additional_body_params(Some(serde_json::json!({"name": "fern"}))),
            Some(serde_json::json!({"name": "fern"}))
        );
    }

    #[test]
    fn test_merge_adds_properties_to_object_body() {
        let opts = RequestOptions::new().additional_body_param("beta_flag", true);
        let merged = opts.merge_additional_body_params(Some(serde_json::json!({"name": "fern"})));
        assert_eq!(
            merged,
            Some(serde_json::json!({"name": "fern", "beta_flag": true}))
        );
    }

    #[test]
    fn test_merge_additional_body_param_overrides_generated_field() {
        let opts = RequestOptions::new().additional_body_param("name", "override");
        let merged = opts.merge_additional_body_params(Some(serde_json::json!({
            "name": "fern",
            "count": 1
        })));
        assert_eq!(
            merged,
            Some(serde_json::json!({"name": "override", "count": 1}))
        );
    }

    #[test]
    fn test_merge_creates_body_when_none() {
        let opts = RequestOptions::new().additional_body_param("beta_flag", true);
        assert_eq!(
            opts.merge_additional_body_params(None),
            Some(serde_json::json!({"beta_flag": true}))
        );
    }

    #[test]
    fn test_merge_creates_body_when_null() {
        let opts = RequestOptions::new().additional_body_param("beta_flag", true);
        assert_eq!(
            opts.merge_additional_body_params(Some(serde_json::Value::Null)),
            Some(serde_json::json!({"beta_flag": true}))
        );
    }

    #[test]
    fn test_merge_nested_values() {
        let opts = RequestOptions::new()
            .additional_body_param("settings", serde_json::json!({"voice": {"speed": 1.5}}))
            .additional_body_param("tags", serde_json::json!(["a", "b"]));
        let merged = opts.merge_additional_body_params(Some(serde_json::json!({
            "settings": {"voice": {"pitch": 2}},
            "text": "hello"
        })));
        // The override is shallow: a top-level key is replaced wholesale, not deep-merged.
        assert_eq!(
            merged,
            Some(serde_json::json!({
                "settings": {"voice": {"speed": 1.5}},
                "tags": ["a", "b"],
                "text": "hello"
            }))
        );
    }

    #[test]
    fn test_merge_leaves_non_object_body_unchanged() {
        let opts = RequestOptions::new().additional_body_param("beta_flag", true);
        assert_eq!(
            opts.merge_additional_body_params(Some(serde_json::json!([1, 2, 3]))),
            Some(serde_json::json!([1, 2, 3]))
        );
        assert_eq!(
            opts.merge_additional_body_params(Some(serde_json::json!("text"))),
            Some(serde_json::json!("text"))
        );
    }
}
