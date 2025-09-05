use percent_encoding::{utf8_percent_encode, CONTROLS};
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
        let encoded_key = utf8_percent_encode(key, CONTROLS).to_string();
        let encoded_value = utf8_percent_encode(&value.to_string(), CONTROLS).to_string();
        self.params.push((encoded_key, encoded_value));
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
                let encoded_key = utf8_percent_encode(key, CONTROLS).to_string();
                let encoded_value = utf8_percent_encode(clean_value, CONTROLS).to_string();
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
