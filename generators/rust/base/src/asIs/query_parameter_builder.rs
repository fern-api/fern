use chrono::{DateTime, Utc};
use serde::Serialize;

/// Modern query builder with type-safe method chaining
/// Provides a clean, Swift-like API for building HTTP query parameters
#[derive(Debug, Default)]
pub struct QueryBuilder {
    params: Vec<(String, String)>,
}

impl QueryBuilder {
    /// Create a new query parameter builder
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a string parameter (accept both required/optional)
    pub fn string(mut self, key: &str, value: impl Into<Option<String>>) -> Self {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v));
        }
        self
    }

    /// Add multiple string parameters with the same key (for allow-multiple query params)
    /// Accepts both Vec<String> and Vec<Option<String>>, adding each non-None value as a separate query parameter
    pub fn string_array<I, T>(mut self, key: &str, values: I) -> Self
    where
        I: IntoIterator<Item = T>,
        T: Into<Option<String>>,
    {
        for value in values {
            if let Some(v) = value.into() {
                self.params.push((key.to_string(), v));
            }
        }
        self
    }

    /// Add an integer parameter (accept both required/optional)
    pub fn int(mut self, key: &str, value: impl Into<Option<i64>>) -> Self {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v.to_string()));
        }
        self
    }

    /// Add a big integer parameter (accept both required/optional)
    pub fn big_int(mut self, key: &str, value: impl Into<Option<num_bigint::BigInt>>) -> Self {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v.to_string()));
        }
        self
    }

    /// Add multiple integer parameters with the same key (for allow-multiple query params)
    /// Accepts both Vec<i64> and Vec<Option<i64>>, adding each non-None value as a separate query parameter
    pub fn int_array<I, T>(mut self, key: &str, values: I) -> Self
    where
        I: IntoIterator<Item = T>,
        T: Into<Option<i64>>,
    {
        for value in values {
            if let Some(v) = value.into() {
                self.params.push((key.to_string(), v.to_string()));
            }
        }
        self
    }

    /// Add a float parameter
    pub fn float(mut self, key: &str, value: impl Into<Option<f64>>) -> Self {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v.to_string()));
        }
        self
    }

    /// Add multiple float parameters with the same key (for allow-multiple query params)
    /// Accepts both Vec<f64> and Vec<Option<f64>>, adding each non-None value as a separate query parameter
    pub fn float_array<I, T>(mut self, key: &str, values: I) -> Self
    where
        I: IntoIterator<Item = T>,
        T: Into<Option<f64>>,
    {
        for value in values {
            if let Some(v) = value.into() {
                self.params.push((key.to_string(), v.to_string()));
            }
        }
        self
    }

    /// Add a boolean parameter
    pub fn bool(mut self, key: &str, value: impl Into<Option<bool>>) -> Self {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v.to_string()));
        }
        self
    }

    /// Add multiple boolean parameters with the same key (for allow-multiple query params)
    /// Accepts both Vec<bool> and Vec<Option<bool>>, adding each non-None value as a separate query parameter
    pub fn bool_array<I, T>(mut self, key: &str, values: I) -> Self
    where
        I: IntoIterator<Item = T>,
        T: Into<Option<bool>>,
    {
        for value in values {
            if let Some(v) = value.into() {
                self.params.push((key.to_string(), v.to_string()));
            }
        }
        self
    }

    /// Add a datetime parameter (DateTime<Utc>)
    pub fn datetime(mut self, key: &str, value: impl Into<Option<DateTime<Utc>>>) -> Self {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v.to_rfc3339_opts(chrono::SecondsFormat::Secs, true)));
        }
        self
    }

    /// Add a UUID parameter (converts to string)
    pub fn uuid(mut self, key: &str, value: impl Into<Option<uuid::Uuid>>) -> Self {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v.to_string()));
        }
        self
    }

    /// Add a date parameter (converts NaiveDate to DateTime<Utc>)
    pub fn date(mut self, key: &str, value: impl Into<Option<chrono::NaiveDate>>) -> Self {
        if let Some(v) = value.into() {
            // Convert NaiveDate to DateTime<Utc> at start of day
            let datetime = v.and_hms_opt(0, 0, 0).unwrap().and_utc();
            self.params.push((key.to_string(), datetime.to_rfc3339_opts(chrono::SecondsFormat::Secs, true)));
        }
        self
    }

    /// Add any serializable parameter (for enums and complex types)
    pub fn serialize<T: Serialize>(mut self, key: &str, value: Option<T>) -> Self {
        if let Some(v) = value {
            // For enums that implement Display, use the Display implementation
            // to avoid JSON quotes in query parameters
            if let Ok(serialized) = serde_json::to_string(&v) {
                // Remove JSON quotes if the value is a simple string
                let cleaned = if serialized.starts_with('"') && serialized.ends_with('"') {
                    serialized.trim_matches('"').to_string()
                } else {
                    serialized
                };
                self.params.push((key.to_string(), cleaned));
            }
        }
        self
    }

    /// Add a deep object query parameter with bracket notation for nested objects.
    /// For example: {"filter": {"name": "john", "age": 30}} becomes filter[name]=john&filter[age]=30
    /// Arrays are serialized in exploded format: {"tags": ["a", "b"]} becomes tags=a&tags=b
    /// Arrays of objects: {"objects": [{"key": "val"}]} becomes objects[key]=val
    pub fn serialize_deep_object<T: Serialize>(mut self, key: &str, value: Option<T>) -> Self {
        if let Some(v) = value {
            if let Ok(json_value) = serde_json::to_value(&v) {
                let flattened = flatten_json_value(&json_value, Some(key));
                self.params.extend(flattened);
            }
        }
        self
    }

    /// Add multiple deep object query parameters with the same key prefix (for allow-multiple with nested objects)
    pub fn serialize_deep_object_array<T: Serialize>(
        mut self,
        key: &str,
        values: impl IntoIterator<Item = T>,
    ) -> Self {
        for value in values {
            if let Ok(json_value) = serde_json::to_value(&value) {
                // Skip null values
                if json_value.is_null() {
                    continue;
                }
                let flattened = flatten_json_value(&json_value, Some(key));
                self.params.extend(flattened);
            }
        }
        self
    }

    /// Add multiple serializable parameters with the same key (for allow-multiple query params with enums)
    /// Accepts both Vec<T> and Vec<Option<T>>, adding each non-None value as a separate query parameter
    pub fn serialize_array<T: Serialize>(
        mut self,
        key: &str,
        values: impl IntoIterator<Item = T>,
    ) -> Self {
        for value in values {
            if let Ok(serialized) = serde_json::to_string(&value) {
                // Skip null values (from Option::None)
                if serialized == "null" {
                    continue;
                }
                // Remove JSON quotes if the value is a simple string
                let cleaned = if serialized.starts_with('"') && serialized.ends_with('"') {
                    serialized.trim_matches('"').to_string()
                } else {
                    serialized
                };
                self.params.push((key.to_string(), cleaned));
            }
        }
        self
    }

    /// Parse and add a structured query string
    /// Handles complex query patterns like:
    /// - "key:value" patterns
    /// - "key:value1,value2" (comma-separated values)
    /// - Quoted values: "key:\"value with spaces\""
    /// - Space-separated terms (treated as AND logic)
    pub fn structured_query(mut self, key: &str, value: impl Into<Option<String>>) -> Self {
        if let Some(query_str) = value.into() {
            if let Ok(parsed_params) = parse_structured_query(&query_str) {
                self.params.extend(parsed_params);
            } else {
                // Fall back to simple query parameter if parsing fails
                self.params.push((key.to_string(), query_str));
            }
        }
        self
    }

    /// Build the final query parameters
    pub fn build(self) -> Option<Vec<(String, String)>> {
        if self.params.is_empty() {
            None
        } else {
            Some(self.params)
        }
    }
}

/// Errors that can occur during structured query parsing
#[derive(Debug)]
pub enum QueryBuilderError {
    InvalidQuerySyntax(String),
}

impl std::fmt::Display for QueryBuilderError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            QueryBuilderError::InvalidQuerySyntax(msg) => {
                write!(f, "Invalid query syntax: {}", msg)
            }
        }
    }
}

impl std::error::Error for QueryBuilderError {}

/// Parse structured query strings like "key:value key2:value1,value2"
/// Used for complex filtering patterns in APIs like Foxglove
///
/// Supported patterns:
/// - Simple: "status:active"
/// - Multiple values: "type:sensor,camera"
/// - Quoted values: "location:\"New York\""
/// - Complex: "status:active type:sensor location:\"San Francisco\""
pub fn parse_structured_query(query: &str) -> Result<Vec<(String, String)>, QueryBuilderError> {
    let mut params = Vec::new();
    let terms = tokenize_query(query);

    for term in terms {
        if let Some((key, values)) = term.split_once(':') {
            // Handle comma-separated values
            for value in values.split(',') {
                let clean_value = value.trim_matches('"'); // Remove quotes
                params.push((key.to_string(), clean_value.to_string()));
            }
        } else {
            // For terms without colons, return error to be explicit about expected format
            return Err(QueryBuilderError::InvalidQuerySyntax(format!(
                "Cannot parse term '{}' - expected 'key:value' format for structured queries",
                term
            )));
        }
    }

    Ok(params)
}

/// Tokenize a query string, properly handling quoted strings
fn tokenize_query(input: &str) -> Vec<String> {
    let mut tokens = Vec::new();
    let mut current_token = String::new();
    let mut in_quotes = false;
    let mut chars = input.chars().peekable();

    while let Some(c) = chars.next() {
        match c {
            '"' => {
                // Toggle quote state and include the quote in the token
                in_quotes = !in_quotes;
                current_token.push(c);
            }
            ' ' if !in_quotes => {
                // Space outside quotes - end current token
                if !current_token.is_empty() {
                    tokens.push(current_token.trim().to_string());
                    current_token.clear();
                }
            }
            _ => {
                // Any other character (including spaces inside quotes)
                current_token.push(c);
            }
        }
    }

    // Add the last token if there is one
    if !current_token.is_empty() {
        tokens.push(current_token.trim().to_string());
    }

    tokens
}

/// Recursively flattens a JSON value into query parameter format with bracket notation.
/// For example: {"filter": {"name": "john"}} becomes [("filter[name]", "john")]
/// Arrays are serialized in exploded format: each item gets the same key.
/// Arrays of objects: each object's fields are flattened with the array key as prefix.
fn flatten_json_value(value: &serde_json::Value, key_prefix: Option<&str>) -> Vec<(String, String)> {
    let mut result = Vec::new();

    match value {
        serde_json::Value::Object(map) => {
            for (k, v) in map {
                let full_key = match key_prefix {
                    Some(prefix) => format!("{}[{}]", prefix, k),
                    None => k.clone(),
                };
                result.extend(flatten_json_value(v, Some(&full_key)));
            }
        }
        serde_json::Value::Array(arr) => {
            let key = key_prefix.unwrap_or("");
            for item in arr {
                if item.is_object() {
                    // Array of objects: flatten each object with the array key as prefix
                    result.extend(flatten_json_value(item, Some(key)));
                } else {
                    // Primitive array: exploded format (same key for each value)
                    let string_value = json_value_to_string(item);
                    if let Some(s) = string_value {
                        result.push((key.to_string(), s));
                    }
                }
            }
        }
        _ => {
            // Primitive value (string, number, bool, null)
            if let Some(key) = key_prefix {
                if let Some(s) = json_value_to_string(value) {
                    result.push((key.to_string(), s));
                }
            }
        }
    }

    result
}

/// Converts a JSON value to a string representation suitable for query parameters.
/// Returns None for null values.
fn json_value_to_string(value: &serde_json::Value) -> Option<String> {
    match value {
        serde_json::Value::Null => None,
        serde_json::Value::Bool(b) => Some(b.to_string()),
        serde_json::Value::Number(n) => Some(n.to_string()),
        serde_json::Value::String(s) => Some(s.clone()),
        // For nested objects/arrays that somehow end up here, serialize as JSON
        _ => serde_json::to_string(value).ok(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deep_object_simple_nested() {
        // Test simple nested object: {"filter": {"name": "john", "age": 30}}
        // Should become: filter[name]=john&filter[age]=30
        let builder = QueryBuilder::new()
            .serialize_deep_object("filter", Some(serde_json::json!({
                "name": "john",
                "age": 30
            })));
        
        let params = builder.build().unwrap();
        assert!(params.contains(&("filter[name]".to_string(), "john".to_string())));
        assert!(params.contains(&("filter[age]".to_string(), "30".to_string())));
    }

    #[test]
    fn test_deep_object_deeply_nested() {
        // Test deeply nested object: {"filter": {"user": {"name": "john"}}}
        // Should become: filter[user][name]=john
        let builder = QueryBuilder::new()
            .serialize_deep_object("filter", Some(serde_json::json!({
                "user": {
                    "name": "john"
                }
            })));
        
        let params = builder.build().unwrap();
        assert_eq!(params, vec![("filter[user][name]".to_string(), "john".to_string())]);
    }

    #[test]
    fn test_deep_object_array_exploded() {
        // Test array (exploded format): {"tags": ["a", "b", "c"]}
        // Should become: tags=a&tags=b&tags=c
        let builder = QueryBuilder::new()
            .serialize_deep_object("tags", Some(serde_json::json!(["a", "b", "c"])));
        
        let params = builder.build().unwrap();
        assert_eq!(params, vec![
            ("tags".to_string(), "a".to_string()),
            ("tags".to_string(), "b".to_string()),
            ("tags".to_string(), "c".to_string()),
        ]);
    }

    #[test]
    fn test_deep_object_array_of_objects() {
        // Test array of objects: {"objects": [{"key": "hello"}, {"key": "world"}]}
        // Should become: objects[key]=hello&objects[key]=world
        let builder = QueryBuilder::new()
            .serialize_deep_object("objects", Some(serde_json::json!([
                {"key": "hello"},
                {"key": "world"}
            ])));
        
        let params = builder.build().unwrap();
        assert_eq!(params, vec![
            ("objects[key]".to_string(), "hello".to_string()),
            ("objects[key]".to_string(), "world".to_string()),
        ]);
    }

    #[test]
    fn test_deep_object_mixed_nested_and_array() {
        // Test mixed: {"filter": {"tags": ["a", "b"], "name": "john"}}
        // Should become: filter[tags]=a&filter[tags]=b&filter[name]=john
        let builder = QueryBuilder::new()
            .serialize_deep_object("filter", Some(serde_json::json!({
                "tags": ["a", "b"],
                "name": "john"
            })));
        
        let params = builder.build().unwrap();
        assert!(params.contains(&("filter[tags]".to_string(), "a".to_string())));
        assert!(params.contains(&("filter[tags]".to_string(), "b".to_string())));
        assert!(params.contains(&("filter[name]".to_string(), "john".to_string())));
    }

    #[test]
    fn test_deep_object_none_value() {
        // Test None value - should not add any params
        let builder = QueryBuilder::new()
            .serialize_deep_object::<serde_json::Value>("filter", None);
        
        let params = builder.build();
        assert!(params.is_none());
    }

    #[test]
    fn test_deep_object_array_method() {
        // Test serialize_deep_object_array with multiple objects
        let objects = vec![
            serde_json::json!({"key": "value1"}),
            serde_json::json!({"key": "value2"}),
        ];
        
        let builder = QueryBuilder::new()
            .serialize_deep_object_array("item", objects);
        
        let params = builder.build().unwrap();
        assert_eq!(params, vec![
            ("item[key]".to_string(), "value1".to_string()),
            ("item[key]".to_string(), "value2".to_string()),
        ]);
    }

    #[test]
    fn test_flatten_json_value_primitive() {
        // Test primitive value
        let value = serde_json::json!("hello");
        let result = flatten_json_value(&value, Some("key"));
        assert_eq!(result, vec![("key".to_string(), "hello".to_string())]);
    }

    #[test]
    fn test_flatten_json_value_null() {
        // Test null value - should return empty
        let value = serde_json::Value::Null;
        let result = flatten_json_value(&value, Some("key"));
        assert!(result.is_empty());
    }
}
