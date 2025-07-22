use thiserror::Error;
use serde::{Deserialize, Serialize};

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum ApiError {
    #[error("UnauthorizedError: Authentication failed - {{message}}")]
    UnauthorizedError { message: String, auth_type: Option<String> },
    #[error("ForbiddenError: Access forbidden - {{message}}")]
    ForbiddenError { message: String, resource: Option<String>, required_permission: Option<String> },
    #[error("NotFoundError: {{resource_type:?}} not found: {{resource_id:?}}")]
    NotFoundError { message: String, resource_id: Option<String>, resource_type: Option<String> },
    #[error("ConflictError: Conflict - {{message}}")]
    ConflictError { message: String, conflict_type: Option<String> },
    #[error("ValidationError: Validation error in field '{{field:?}}': {{validation_error:?}}")]
    ValidationError { message: String, field: Option<String>, validation_error: Option<String> },
    
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
            403 => {
                // Parse error body for ForbiddenError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::ForbiddenError {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            resource: parsed.get("resource")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            required_permission: parsed.get("required_permission")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::ForbiddenError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    resource: None,
                    required_permission: None,
                }
            },
            404 => {
                // Parse error body for NotFoundError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::NotFoundError {
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
                Self::NotFoundError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    resource_id: None,
                    resource_type: None,
                }
            },
            409 => {
                // Parse error body for ConflictError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::ConflictError {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            conflict_type: parsed.get("conflict_type")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::ConflictError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    conflict_type: None,
                }
            },
            422 => {
                // Parse error body for ValidationError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::ValidationError {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            field: parsed.get("field")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            validation_error: parsed.get("validation_error")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::ValidationError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    field: None,
                    validation_error: None,
                }
            },
            _ => Self::Http {
                status: status_code,
                message: body.unwrap_or("Unknown error").to_string(),
            },
        }
    }
}
