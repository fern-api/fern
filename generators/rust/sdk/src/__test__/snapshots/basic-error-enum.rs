use thiserror::{Error};

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("UnauthorizedError: Authentication failed - {{message}}")]
    UnauthorizedError { message: String, auth_type: Option<String> },
    #[error("NotFoundError: Resource not found - {{message}}")]
    NotFoundError { message: String, resource_id: Option<String>, resource_type: Option<String> },
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
        _ => Self::Http {
            status: status_code,
            message: body.unwrap_or("Unknown error").to_string()
        },
    }
}
}

