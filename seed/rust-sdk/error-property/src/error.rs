use thiserror::Error;
use serde::{Deserialize, Serialize};

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum ApiError {
    #[error("PropertyBasedErrorTest: Validation error in field '{{field:?}}': {{message}}")]
    PropertyBasedErrorTest { message: String, field: Option<String>, details: Option<String> },
    
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
            400 => {
                // Parse error body for PropertyBasedErrorTest
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::PropertyBasedErrorTest {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            field: parsed.get("field")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            details: parsed.get("details")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::PropertyBasedErrorTest {
                    message: body.unwrap_or("Unknown error").to_string(),
                    field: None,
                    details: None,
                }
            },
            _ => Self::Http {
                status: status_code,
                message: body.unwrap_or("Unknown error").to_string(),
            },
        }
    }
}
