use thiserror::Error;
use serde::{Deserialize, Serialize};

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum ApiError {
    #[error("RateLimitError: Rate limit exceeded. Retry after {{retry_after_seconds:?}} seconds")]
    RateLimitError { message: String, retry_after_seconds: Option<u64>, limit_type: Option<String> },
    #[error("MaintenanceError: {{message}}")]
    MaintenanceError { message: String },
    
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
            429 => {
                // Parse error body for RateLimitError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::RateLimitError {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            retry_after_seconds: parsed.get("retry_after_seconds")
                                .and_then(|v| v.as_u64()),
                            limit_type: parsed.get("limit_type")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::RateLimitError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    retry_after_seconds: None,
                    limit_type: None,
                }
            },
            503 => {
                // Parse error body for MaintenanceError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::MaintenanceError {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),

                        };
                    }
                }
                Self::MaintenanceError {
                    message: body.unwrap_or("Unknown error").to_string(),

                }
            },
            _ => Self::Http {
                status: status_code,
                message: body.unwrap_or("Unknown error").to_string(),
            },
        }
    }
}
