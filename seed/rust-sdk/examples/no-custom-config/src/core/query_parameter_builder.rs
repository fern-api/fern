use chrono::{DateTime, TimeZone};
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

    /// Add a datetime parameter (any DateTime timezone)
    pub fn datetime<Tz: TimeZone>(mut self, key: &str, value: impl Into<Option<DateTime<Tz>>>) -> Self
    where
        Tz::Offset: std::fmt::Display,
    {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v.to_rfc3339_opts(chrono::SecondsFormat::Secs, true)));
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

    /// Add a UUID parameter (converts to string)
    pub fn uuid(mut self, key: &str, value: impl Into<Option<uuid::Uuid>>) -> Self {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v.to_string()));
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

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{NaiveDate, TimeZone, Utc};

    // ===========================
    // QueryBuilder tests
    // ===========================

    #[test]
    fn test_empty_builder_returns_none() {
        let result = QueryBuilder::new().build();
        assert!(result.is_none());
    }

    #[test]
    fn test_string_param_some() {
        let result = QueryBuilder::new()
            .string("name", Some("alice".to_string()))
            .build();
        assert_eq!(result, Some(vec![("name".to_string(), "alice".to_string())]));
    }

    #[test]
    fn test_string_param_none_skipped() {
        let result = QueryBuilder::new()
            .string("name", None::<String>)
            .build();
        assert!(result.is_none());
    }

    #[test]
    fn test_int_param() {
        let result = QueryBuilder::new().int("page", Some(42i64)).build();
        assert_eq!(result, Some(vec![("page".to_string(), "42".to_string())]));
    }

    #[test]
    fn test_int_param_none_skipped() {
        let result = QueryBuilder::new().int("page", None::<i64>).build();
        assert!(result.is_none());
    }

    #[test]
    fn test_float_param() {
        let result = QueryBuilder::new().float("score", Some(3.14f64)).build();
        assert_eq!(
            result,
            Some(vec![("score".to_string(), "3.14".to_string())])
        );
    }

    #[test]
    fn test_bool_param() {
        let result = QueryBuilder::new().bool("active", Some(true)).build();
        assert_eq!(
            result,
            Some(vec![("active".to_string(), "true".to_string())])
        );
    }

    #[test]
    fn test_uuid_param() {
        let id = uuid::Uuid::parse_str("550e8400-e29b-41d4-a716-446655440000").unwrap();
        let result = QueryBuilder::new().uuid("id", Some(id)).build();
        assert_eq!(
            result,
            Some(vec![(
                "id".to_string(),
                "550e8400-e29b-41d4-a716-446655440000".to_string()
            )])
        );
    }

    #[test]
    fn test_datetime_param_formats_rfc3339() {
        let dt = Utc.with_ymd_and_hms(2024, 1, 15, 9, 30, 0).unwrap();
        let result = QueryBuilder::new().datetime("since", Some(dt)).build();
        assert_eq!(
            result,
            Some(vec![(
                "since".to_string(),
                "2024-01-15T09:30:00Z".to_string()
            )])
        );
    }

    #[test]
    fn test_date_param_converts_to_midnight_utc() {
        let date = NaiveDate::from_ymd_opt(2024, 1, 15).unwrap();
        let result = QueryBuilder::new().date("on", Some(date)).build();
        assert_eq!(
            result,
            Some(vec![(
                "on".to_string(),
                "2024-01-15T00:00:00Z".to_string()
            )])
        );
    }



    #[test]
    fn test_string_array_multiple_entries() {
        let result = QueryBuilder::new()
            .string_array("tag", vec!["a".to_string(), "b".to_string(), "c".to_string()])
            .build();
        assert_eq!(
            result,
            Some(vec![
                ("tag".to_string(), "a".to_string()),
                ("tag".to_string(), "b".to_string()),
                ("tag".to_string(), "c".to_string()),
            ])
        );
    }

    #[test]
    fn test_int_array() {
        let result = QueryBuilder::new()
            .int_array("ids", vec![1i64, 2, 3])
            .build();
        assert_eq!(
            result,
            Some(vec![
                ("ids".to_string(), "1".to_string()),
                ("ids".to_string(), "2".to_string()),
                ("ids".to_string(), "3".to_string()),
            ])
        );
    }

    #[test]
    fn test_float_array() {
        let result = QueryBuilder::new()
            .float_array("scores", vec![1.1f64, 2.2])
            .build();
        assert_eq!(
            result,
            Some(vec![
                ("scores".to_string(), "1.1".to_string()),
                ("scores".to_string(), "2.2".to_string()),
            ])
        );
    }

    #[test]
    fn test_bool_array() {
        let result = QueryBuilder::new()
            .bool_array("flags", vec![true, false])
            .build();
        assert_eq!(
            result,
            Some(vec![
                ("flags".to_string(), "true".to_string()),
                ("flags".to_string(), "false".to_string()),
            ])
        );
    }

    #[test]
    fn test_serialize_strips_json_quotes() {
        let result = QueryBuilder::new()
            .serialize("status", Some("active"))
            .build();
        assert_eq!(
            result,
            Some(vec![("status".to_string(), "active".to_string())])
        );
    }

    #[test]
    fn test_serialize_none_skipped() {
        let result = QueryBuilder::new()
            .serialize::<String>("status", None)
            .build();
        assert!(result.is_none());
    }

    #[test]
    fn test_serialize_numeric_no_quotes() {
        let result = QueryBuilder::new()
            .serialize("count", Some(42))
            .build();
        assert_eq!(
            result,
            Some(vec![("count".to_string(), "42".to_string())])
        );
    }

    #[test]
    fn test_serialize_array_skips_null() {
        let values: Vec<Option<&str>> = vec![Some("a"), None, Some("b")];
        let result = QueryBuilder::new()
            .serialize_array("items", values)
            .build();
        assert_eq!(
            result,
            Some(vec![
                ("items".to_string(), "a".to_string()),
                ("items".to_string(), "b".to_string()),
            ])
        );
    }

    #[test]
    fn test_method_chaining() {
        let result = QueryBuilder::new()
            .string("name", Some("alice".to_string()))
            .int("page", Some(1i64))
            .bool("active", Some(true))
            .build();
        assert_eq!(
            result,
            Some(vec![
                ("name".to_string(), "alice".to_string()),
                ("page".to_string(), "1".to_string()),
                ("active".to_string(), "true".to_string()),
            ])
        );
    }


    // ===========================
    // parse_structured_query tests
    // ===========================

    #[test]
    fn test_parse_simple_key_value() {
        let result = parse_structured_query("status:active").unwrap();
        assert_eq!(result, vec![("status".to_string(), "active".to_string())]);
    }

    #[test]
    fn test_parse_comma_separated_values() {
        let result = parse_structured_query("type:sensor,camera").unwrap();
        assert_eq!(
            result,
            vec![
                ("type".to_string(), "sensor".to_string()),
                ("type".to_string(), "camera".to_string()),
            ]
        );
    }

    #[test]
    fn test_parse_multiple_terms() {
        let result = parse_structured_query("status:active type:sensor").unwrap();
        assert_eq!(
            result,
            vec![
                ("status".to_string(), "active".to_string()),
                ("type".to_string(), "sensor".to_string()),
            ]
        );
    }

    #[test]
    fn test_parse_quoted_value() {
        let result = parse_structured_query("location:\"New York\"").unwrap();
        assert_eq!(
            result,
            vec![("location".to_string(), "New York".to_string())]
        );
    }

    #[test]
    fn test_parse_bare_word_returns_error() {
        let result = parse_structured_query("bareword");
        assert!(result.is_err());
    }

    #[test]
    fn test_structured_query_builder_fallback() {
        // When parsing fails, structured_query falls back to simple param
        let result = QueryBuilder::new()
            .structured_query("q", Some("bareword".to_string()))
            .build();
        assert_eq!(
            result,
            Some(vec![("q".to_string(), "bareword".to_string())])
        );
    }

    #[test]
    fn test_structured_query_builder_parses() {
        let result = QueryBuilder::new()
            .structured_query("q", Some("status:active".to_string()))
            .build();
        assert_eq!(
            result,
            Some(vec![("status".to_string(), "active".to_string())])
        );
    }

    #[test]
    fn test_structured_query_none_skipped() {
        let result = QueryBuilder::new()
            .structured_query("q", None::<String>)
            .build();
        assert!(result.is_none());
    }
}
