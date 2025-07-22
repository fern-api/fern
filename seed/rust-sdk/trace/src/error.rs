use thiserror::Error;
use serde::{Deserialize, Serialize};

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum ApiError {
    #[error("PlaylistIdNotFoundError: {{resource_type:?}} not found: {{resource_id:?}}")]
    PlaylistIdNotFoundError { message: String, resource_id: Option<String>, resource_type: Option<String> },
    #[error("UnauthorizedError: Authentication failed - {{message}}")]
    UnauthorizedError { auth_type: Option<String> },
    
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
            404 => {
                // Parse error body for PlaylistIdNotFoundError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::PlaylistIdNotFoundError {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            resource_id: parsed.get("resource_id")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            resource_type: parsed.get("resource_type")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::PlaylistIdNotFoundError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    resource_id: None,
                    resource_type: None,
                }
            },
            401 => {
                // Parse error body for UnauthorizedError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::UnauthorizedError {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            auth_type: parsed.get("auth_type")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::UnauthorizedError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    auth_type: None,
                }
            },
            _ => Self::Http {
                status: status_code,
                message: body.unwrap_or("Unknown error").to_string(),
            },
        }
    }
}
