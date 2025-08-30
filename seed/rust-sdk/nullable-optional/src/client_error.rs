use reqwest::StatusCode;

/// Errors that can occur when using the API client
#[derive(Debug, thiserror::Error)]
pub enum ClientError {
    #[error("HTTP client error: {0}")]
    HttpClientError(#[from] reqwest::Error),
    
    #[error("HTTP error: {0}")]
    HttpError(StatusCode),
    
    #[error("Request error: {0}")]
    RequestError(reqwest::Error),
    
    #[error("JSON parse error: {0}")]
    JsonParseError(#[from] serde_json::Error),
    
    #[error("Invalid header value")]
    InvalidHeader,
    
    #[error("Could not clone request for retry")]
    RequestCloneError,
    
    #[error("Configuration error: {0}")]
    ConfigError(String),
}