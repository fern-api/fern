use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("NotFoundError: Resource not found - {{message}}")]
    NotFoundError {
        message: String,
        resource_id: Option<String>,
        resource_type: Option<String>,
    },
    #[error("BadRequestError: Bad request - {{message}}")]
    BadRequestError {
        message: String,
        field: Option<String>,
        details: Option<String>,
    },
    #[error("InternalServerError: Internal server error - {{message}}")]
    InternalServerError {
        message: String,
        error_id: Option<String>,
    },
    #[error("FooTooMuch: Rate limit exceeded - {{message}}")]
    FooTooMuch {
        message: String,
        retry_after_seconds: Option<u64>,
        limit_type: Option<String>,
    },
    #[error("FooTooLittle: Internal server error - {{message}}")]
    FooTooLittle {
        message: String,
        error_id: Option<String>,
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
                // Parse error body for NotFoundError;
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::NotFoundError {
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
                return Self::NotFoundError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    resource_id: None,
                    resource_type: None,
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
                            field: parsed
                                .get("field")
                                .and_then(|v| v.as_str().map(|s| s.to_string())),
                            details: parsed
                                .get("details")
                                .and_then(|v| v.as_str().map(|s| s.to_string())),
                        };
                    }
                }
                return Self::BadRequestError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    field: None,
                    details: None,
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
                                error_id: parsed
                                    .get("error_id")
                                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                            },
                            Some("FooTooLittle") => Self::FooTooLittle {
                                message: message,
                                error_id: parsed
                                    .get("error_id")
                                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                            },
                            _ => Self::InternalServerError {
                                message: message,
                                error_id: parsed
                                    .get("error_id")
                                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                            },
                        };
                    }
                    return Self::InternalServerError {
                        message: body.unwrap_or("Unknown error").to_string(),
                        error_id: None,
                    };
                }
                return Self::InternalServerError {
                    message: "Unknown error".to_string(),
                    error_id: None,
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
                            retry_after_seconds: parsed
                                .get("retry_after_seconds")
                                .and_then(|v| v.as_u64()),
                            limit_type: parsed
                                .get("limit_type")
                                .and_then(|v| v.as_str().map(|s| s.to_string())),
                        };
                    }
                }
                return Self::FooTooMuch {
                    message: body.unwrap_or("Unknown error").to_string(),
                    retry_after_seconds: None,
                    limit_type: None,
                };
            }
            _ => Self::Http {
                status: status_code,
                message: body.unwrap_or("Unknown error").to_string(),
            },
        }
    }
}
