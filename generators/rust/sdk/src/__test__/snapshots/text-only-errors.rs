use thiserror::{Error};

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("SimpleError: Bad request - {{message}}")]
    SimpleError { message: String, field: Option<String>, details: Option<String> },
    #[error("GenericError: Internal server error - {{message}}")]
    GenericError { message: String, error_id: Option<String> },
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
        400 => {
            // Parse error body for SimpleError;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::SimpleError {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        field: parsed.get("field").and_then(|v| v.as_str().map(|s| s.to_string())),
                        details: parsed.get("details").and_then(|v| v.as_str().map(|s| s.to_string()))
                    };
                }
            }
            return Self::SimpleError {
                message: body.unwrap_or("Unknown error").to_string(),
                field: None,
                details: None
            };
        },
        500 => {
            // Parse error body for GenericError;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::GenericError {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        error_id: parsed.get("error_id").and_then(|v| v.as_str().map(|s| s.to_string()))
                    };
                }
            }
            return Self::GenericError {
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

