use percent_encoding::{utf8_percent_encode, NON_ALPHANUMERIC};
use std::collections::HashMap;
use thiserror::Error;

/// Generic query parameter builder for various query patterns
#[derive(Debug, Default)]
pub struct QueryParameterBuilder {
    params: Vec<(String, String)>,
}

/// Errors that can occur during query building
#[derive(Debug, Error)]
pub enum QueryBuilderError {
    #[error("Invalid query syntax: {0}")]
    InvalidQuerySyntax(String),
    #[error("URL encoding error: {0}")]
    EncodingError(String),
}

impl QueryParameterBuilder {
    /// Create a new query parameter builder
    pub fn new() -> Self {
        Self { params: Vec::new() }
    }

    /// Add a simple key-value parameter with URL encoding
    pub fn add_simple<T: ToString>(&mut self, key: &str, value: T) {
        let encoded_key = utf8_percent_encode(key, NON_ALPHANUMERIC).to_string();
        let encoded_value = utf8_percent_encode(&value.to_string(), NON_ALPHANUMERIC).to_string();
        self.params.push((encoded_key, encoded_value));
    }

    /// Add a raw parameter without additional processing
    /// Useful when the value is already in the desired format
    pub fn add_raw(&mut self, key: &str, value: &str) {
        let encoded_key = utf8_percent_encode(key, NON_ALPHANUMERIC).to_string();
        let encoded_value = utf8_percent_encode(value, NON_ALPHANUMERIC).to_string();
        self.params.push((encoded_key, encoded_value));
    }

    /// Add parameters from a HashMap
    pub fn add_from_hashmap(&mut self, map: &HashMap<String, String>) {
        for (key, value) in map {
            self.add_simple(key, value);
        }
    }

    /// Add multiple values for the same key (useful for array-like parameters)
    pub fn add_multiple<T: ToString + std::fmt::Display>(&mut self, key: &str, values: &[T]) {
        for value in values {
            self.add_simple(key, value);
        }
    }

    /// Try to parse a complex query string using common patterns
    /// This is a best-effort generic parser that handles:
    /// - "key:value" patterns
    /// - "key:value1,value2" (comma-separated values)
    /// - Quoted values: "key:\"value with spaces\""
    /// - Space-separated terms (treated as AND logic)
    pub fn add_structured_query(&mut self, query: &str) -> Result<(), QueryBuilderError> {
        let parsed_params = parse_structured_query(query)?;
        self.params.extend(parsed_params);
        Ok(())
    }

    /// Build the final query parameter vector
    pub fn build(self) -> Vec<(String, String)> {
        self.params
    }

    /// Get the current number of parameters
    pub fn len(&self) -> usize {
        self.params.len()
    }

    /// Check if the builder is empty
    pub fn is_empty(&self) -> bool {
        self.params.is_empty()
    }
}

/// Generic parser for structured query strings
/// Handles common patterns like "key:value key2:value1,value2"
pub fn parse_structured_query(query: &str) -> Result<Vec<(String, String)>, QueryBuilderError> {
    let mut params = Vec::new();

    // Tokenize the query string properly handling quoted strings
    let terms = tokenize_query(query);

    for term in terms {
        if let Some((key, values)) = term.split_once(':') {
            // Handle comma-separated values
            for value in values.split(',') {
                let clean_value = value.trim_matches('"'); // Remove quotes
                let encoded_key = utf8_percent_encode(key, NON_ALPHANUMERIC).to_string();
                let encoded_value = utf8_percent_encode(clean_value, NON_ALPHANUMERIC).to_string();
                params.push((encoded_key, encoded_value));
            }
        } else {
            // For terms without colons, we could treat them as general search
            // but since this is generic, we'll return an error to be explicit
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

    #[test]
    fn test_simple_parameters() {
        let mut builder = QueryParameterBuilder::new();
        builder.add_simple("name", "test");
        builder.add_simple("status", "active");

        let params = builder.build();
        assert_eq!(params.len(), 2);
    }

    #[test]
    fn test_url_encoding() {
        let mut builder = QueryParameterBuilder::new();
        builder.add_simple("name", "test with spaces");
        builder.add_simple("special", "chars@#$%");

        let params = builder.build();
        assert!(params[0].1.contains("%20")); // Space encoded
        assert!(params[1].1.contains("%40")); // @ encoded
    }

    #[test]
    fn test_structured_query_basic() {
        let query = "name:robot status:active";
        let params = parse_structured_query(query).unwrap();

        assert_eq!(params.len(), 2);
    }

    #[test]
    fn test_structured_query_comma_values() {
        let query = "status:active,inactive type:robot";
        let params = parse_structured_query(query).unwrap();

        assert_eq!(params.len(), 3);
        // Should have: status=active, status=inactive, type=robot
    }

    #[test]
    fn test_structured_query_quoted_values() {
        let query = r#"name:"robot with spaces" status:active"#;
        let params = parse_structured_query(query).unwrap();

        assert_eq!(params.len(), 2);

        // Find the name parameter and check its value contains encoded spaces
        let name_param = params.iter().find(|(k, _)| k.contains("name")).unwrap();
        assert!(name_param.1.contains("%20"));
    }

    #[test]
    fn test_multiple_values() {
        let mut builder = QueryParameterBuilder::new();
        builder.add_multiple("tags", &["rust", "api", "sdk"]);

        let params = builder.build();
        assert_eq!(params.len(), 3);

        // All should have the same key
        for (key, _) in &params {
            assert!(key.contains("tags"));
        }
    }

    #[test]
    fn test_hashmap_addition() {
        let mut map = HashMap::new();
        map.insert("key1".to_string(), "value1".to_string());
        map.insert("key2".to_string(), "value2".to_string());

        let mut builder = QueryParameterBuilder::new();
        builder.add_from_hashmap(&map);

        let params = builder.build();
        assert_eq!(params.len(), 2);
    }

    #[test]
    fn test_invalid_structured_query() {
        let query = "invalid term without colon";
        let result = parse_structured_query(query);
        assert!(result.is_err());
    }
}
