use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("MovieDoesNotExistError: Resource not found - {{message}}")]
    MovieDoesNotExistError {
        message: String,
        resource_id: Option<String>,
        resource_type: Option<String>,
    },
    #[error("HTTP error {status}: {message}")]
    Http { status: u16, message: String },
    #[error("Network error: {0}")]
    Network(reqwest::Error),
    #[error("Serialization error: {0}")]
    Serialization(serde_json::Error),
    #[error("Configuration error: {0}")]
    Configuration(String),
    #[error("Invalid header value")]
    InvalidHeader,
    #[error("Could not clone request for retry")]
    RequestClone,
    #[error("SSE stream terminated")]
    StreamTerminated,
    #[error("SSE parse error: {0}")]
    SseParseError(String),
}

impl ApiError {
    pub fn from_response(status_code: u16, body: Option<&str>) -> Self {
        match status_code {
            404 => {
                // Parse error body for MovieDoesNotExistError;
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::MovieDoesNotExistError {
                            message: parsed
                                .get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            resource_id: parsed
                                .get("resource_id")
                                .and_then(|v| v.as_str().map(|s| s.to_string())),
                            resource_type: parsed
                                .get("resource_type")
                                .and_then(|v| v.as_str().map(|s| s.to_string())),
                        };
                    }
                }
                return Self::MovieDoesNotExistError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    resource_id: None,
                    resource_type: None,
                };
            }
            _ => Self::Http {
                status: status_code,
                message: body.unwrap_or("Unknown error").to_string(),
            },
        }
    }
}
