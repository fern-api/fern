use thiserror::Error;
use serde::{Deserialize, Serialize};

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum ApiError {

    
    #[error("HTTP error {status}: {message}")]
    Http { status: u16, message: String },
    
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),
    
    #[error("Serialization error: {0}")]  
    Serialization(#[from] serde_json::Error),
}

impl ApiError {
    /// Create ApiError from HTTP response
    pub fn from_response(status_code: u16, body: Option<&str>) -> Self {
        match status_code {

            _ => Self::Http {
                status: status_code,
                message: body.unwrap_or("Unknown error").to_string(),
            },
        }
    }
}
