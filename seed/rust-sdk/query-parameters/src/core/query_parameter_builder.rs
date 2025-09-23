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

    /// Add a string parameter
    pub fn string(mut self, key: &str, value: Option<String>) -> Self {
        if let Some(v) = value {
            self.params.push((key.to_string(), v));
        }
        self
    }

    /// Add an integer parameter - handles both i32 and i64 automatically
    pub fn int(mut self, key: &str, value: Option<impl Into<i64>>) -> Self {
        if let Some(v) = value {
            self.params.push((key.to_string(), v.into().to_string()));
        }
        self
    }

    /// Add a float parameter
    pub fn float(mut self, key: &str, value: Option<f64>) -> Self {
        if let Some(v) = value {
            self.params.push((key.to_string(), v.to_string()));
        }
        self
    }

    /// Add a boolean parameter
    pub fn bool(mut self, key: &str, value: Option<bool>) -> Self {
        if let Some(v) = value {
            self.params.push((key.to_string(), v.to_string()));
        }
        self
    }

    /// Add a datetime parameter
    pub fn datetime(mut self, key: &str, value: Option<DateTime<Utc>>) -> Self {
        if let Some(v) = value {
            self.params.push((key.to_string(), v.to_rfc3339()));
        }
        self
    }

    /// Add a UUID parameter (converts to string)
    pub fn uuid(mut self, key: &str, value: Option<uuid::Uuid>) -> Self {
        if let Some(v) = value {
            self.params.push((key.to_string(), v.to_string()));
        }
        self
    }

    /// Add a date parameter (converts NaiveDate to DateTime<Utc>)
    pub fn date(mut self, key: &str, value: Option<chrono::NaiveDate>) -> Self {
        if let Some(v) = value {
            // Convert NaiveDate to DateTime<Utc> at start of day
            let datetime = v.and_hms_opt(0, 0, 0).unwrap().and_utc();
            self.params.push((key.to_string(), datetime.to_rfc3339()));
        }
        self
    }

    /// Add any serializable parameter (for enums and complex types)
    pub fn serialize<T: Serialize>(mut self, key: &str, value: Option<T>) -> Self {
        if let Some(v) = value {
            if let Ok(serialized) = serde_json::to_string(&v) {
                self.params.push((key.to_string(), serialized));
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
    pub fn structured_query(mut self, key: &str, query: Option<String>) -> Self {
        if let Some(query_str) = query {
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
