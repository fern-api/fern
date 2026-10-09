use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("NotFoundError: Resource not found - {message}")]
    NotFoundError { message: String, code: Option<i64> },
    #[error("BadRequestError: Bad request - {message}")]
    BadRequestError { message: String, code: Option<i64> },
    #[error("InternalServerError: Internal server error - {message}")]
    InternalServerError { message: String, code: Option<i64> },
    #[error("FooTooMuch: Rate limit exceeded - {message}")]
    FooTooMuch { message: String, code: Option<i64> },
    #[error("FooTooLittle: Internal server error - {message}")]
    FooTooLittle { message: String, code: Option<i64> },
    #[error("HTTP error {status}: {message}")]
    Http { status: u16, message: String },
    #[error("Network error: {0}")]
    Network(reqwest::Error),
    #[error("Request executor error: {0}")]
    Executor(Box<dyn std::error::Error + Send + Sync>),
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
    #[error("SSE stream timed out waiting for next event")]
    StreamTimeout,
    #[error("SSE parse error: {0}")]
    SseParseError(String),
}

impl ApiError {
    pub fn from_response(status_code: u16, body: Option<&str>) -> Self {
        match status_code {
            404 => {
                // Parse error body for NotFoundError;
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::NotFoundError {
                            message: parsed
                                .get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            code: parsed
                                .get("code")
                                .and_then(|v| serde_json::from_value::<i64>(v.clone()).ok()),
                        };
                    }
                }
                return Self::NotFoundError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    code: None,
                };
            }
            400 => {
                // Parse error body for BadRequestError;
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::BadRequestError {
                            message: parsed
                                .get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            code: parsed
                                .get("code")
                                .and_then(|v| serde_json::from_value::<i64>(v.clone()).ok()),
                        };
                    }
                }
                return Self::BadRequestError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    code: None,
                };
            }
            500 => {
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        let message = parsed
                            .get("message")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string())
                            .unwrap_or("Unknown error".to_string());
                        let error_type = parsed.get("error_type").and_then(|v| v.as_str());
                        return match error_type {
                            Some("InternalServerError") => Self::InternalServerError {
                                message: message,
                                code: parsed
                                    .get("code")
                                    .and_then(|v| serde_json::from_value::<i64>(v.clone()).ok()),
                            },
                            Some("FooTooLittle") => Self::FooTooLittle {
                                message: message,
                                code: parsed
                                    .get("code")
                                    .and_then(|v| serde_json::from_value::<i64>(v.clone()).ok()),
                            },
                            _ => Self::InternalServerError {
                                message: message,
                                code: parsed
                                    .get("code")
                                    .and_then(|v| serde_json::from_value::<i64>(v.clone()).ok()),
                            },
                        };
                    }
                    return Self::InternalServerError {
                        message: body.unwrap_or("Unknown error").to_string(),
                        code: None,
                    };
                }
                return Self::InternalServerError {
                    message: "Unknown error".to_string(),
                    code: None,
                };
            }
            429 => {
                // Parse error body for FooTooMuch;
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::FooTooMuch {
                            message: parsed
                                .get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            code: parsed
                                .get("code")
                                .and_then(|v| serde_json::from_value::<i64>(v.clone()).ok()),
                        };
                    }
                }
                return Self::FooTooMuch {
                    message: body.unwrap_or("Unknown error").to_string(),
                    code: None,
                };
            }
            _ => Self::Http {
                status: status_code,
                message: body.unwrap_or("Unknown error").to_string(),
            },
        }
    }
}

/// Error returned when a required field was not set on a builder.
#[derive(Debug)]
pub struct BuildError {
    field: &'static str,
}

impl BuildError {
    pub fn missing_field(field: &'static str) -> Self {
        Self { field }
    }
}

impl std::fmt::Display for BuildError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "`{}` was not set but is required", self.field)
    }
}

impl std::error::Error for BuildError {}
