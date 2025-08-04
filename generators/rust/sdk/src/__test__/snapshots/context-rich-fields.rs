use thiserror::{Error};

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("UnauthorizedError: Authentication failed - {{message}}")]
    UnauthorizedError { message: String, auth_type: Option<String> },
    #[error("NotFoundError: Resource not found - {{message}}")]
    NotFoundError { message: String, resource_id: Option<String>, resource_type: Option<String> },
    #[error("ValidationError: Unprocessable entity - {{message}}")]
    ValidationError { message: String, field: Option<String>, validation_error: Option<String> },
    #[error("RateLimitError: Rate limit exceeded - {{message}}")]
    RateLimitError { message: String, retry_after_seconds: Option<u64>, limit_type: Option<String> },
    #[error("InternalServerError: Internal server error - {{message}}")]
    InternalServerError { message: String, error_id: Option<String> },
    #[error("HTTP error {status}: {message}")]
    Http { status: u16, message: String },
    #[error("Network error: {0}")]
    Network(reqwest::Error),
    #[error("Serialization error: {0}")]
    Serialization(serde_json::Error),
}

impl ApiError {
    pub fn from_response(status_code: u16, body: Option<&str>) -> Self {
    match status_code {
        401 => {
            // Parse error body for UnauthorizedError;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::UnauthorizedError {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        auth_type: parsed.get("auth_type").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::UnauthorizedError {
                message: body.unwrap_or("Unknown error").to_string(),
                auth_type: None
            };
        },
        404 => {
            // Parse error body for NotFoundError;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::NotFoundError {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        resource_id: parsed.get("resource_id").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        resource_type: parsed.get("resource_type").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::NotFoundError {
                message: body.unwrap_or("Unknown error").to_string(),
                resource_id: None,
                resource_type: None
            };
        },
        422 => {
            // Parse error body for ValidationError;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::ValidationError {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        field: parsed.get("field").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        validation_error: parsed.get("validation_error").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::ValidationError {
                message: body.unwrap_or("Unknown error").to_string(),
                field: None,
                validation_error: None
            };
        },
        429 => {
            // Parse error body for RateLimitError;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::RateLimitError {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        retry_after_seconds: parsed.get("retry_after_seconds").and_then(|v| v.as_u64()),
                        limit_type: parsed.get("limit_type").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::RateLimitError {
                message: body.unwrap_or("Unknown error").to_string(),
                retry_after_seconds: None,
                limit_type: None
            };
        },
        500 => {
            // Parse error body for InternalServerError;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::InternalServerError {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        error_id: parsed.get("error_id").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::InternalServerError {
                message: body.unwrap_or("Unknown error").to_string(),
                error_id: None
            };
        },
        _ => Self::Http {
            status: status_code,
            message: body.unwrap_or("Unknown error").to_string()
        },
    }
}
}

