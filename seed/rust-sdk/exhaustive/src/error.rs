use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("BadRequestBody: Bad request - {{message}}")]
    BadRequestBody {
        message: String,
        field: Option<String>,
        details: Option<String>,
    },
    #[error("ErrorWithEnumBody: Bad request - {{message}}")]
    ErrorWithEnumBody {
        message: String,
        field: Option<String>,
        details: Option<String>,
    },
    #[error("ObjectWithOptionalFieldError: Bad request - {{message}}")]
    ObjectWithOptionalFieldError {
        message: String,
        field: Option<String>,
        details: Option<String>,
    },
    #[error("ObjectWithRequiredFieldError: Bad request - {{message}}")]
    ObjectWithRequiredFieldError {
        message: String,
        field: Option<String>,
        details: Option<String>,
    },
    #[error("NestedObjectWithOptionalFieldError: Bad request - {{message}}")]
    NestedObjectWithOptionalFieldError {
        message: String,
        field: Option<String>,
        details: Option<String>,
    },
    #[error("NestedObjectWithRequiredFieldError: Bad request - {{message}}")]
    NestedObjectWithRequiredFieldError {
        message: String,
        field: Option<String>,
        details: Option<String>,
    },
    #[error("ErrorWithUnionBody: Bad request - {{message}}")]
    ErrorWithUnionBody {
        message: String,
        field: Option<String>,
        details: Option<String>,
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
            400 => {
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        let message = parsed
                            .get("message")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string())
                            .unwrap_or("Unknown error".to_string());
                        let error_type = parsed.get("error_type").and_then(|v| v.as_str());
                        return match error_type {
                            Some("BadRequestBody") => Self::BadRequestBody {
                                message: message,
                                field: parsed
                                    .get("field")
                                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                                details: parsed
                                    .get("details")
                                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                            },
                            Some("ErrorWithEnumBody") => Self::ErrorWithEnumBody {
                                message: message,
                                field: parsed
                                    .get("field")
                                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                                details: parsed
                                    .get("details")
                                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                            },
                            Some("ObjectWithOptionalFieldError") => {
                                Self::ObjectWithOptionalFieldError {
                                    message: message,
                                    field: parsed
                                        .get("field")
                                        .and_then(|v| v.as_str().map(|s| s.to_string())),
                                    details: parsed
                                        .get("details")
                                        .and_then(|v| v.as_str().map(|s| s.to_string())),
                                }
                            }
                            Some("ObjectWithRequiredFieldError") => {
                                Self::ObjectWithRequiredFieldError {
                                    message: message,
                                    field: parsed
                                        .get("field")
                                        .and_then(|v| v.as_str().map(|s| s.to_string())),
                                    details: parsed
                                        .get("details")
                                        .and_then(|v| v.as_str().map(|s| s.to_string())),
                                }
                            }
                            Some("NestedObjectWithOptionalFieldError") => {
                                Self::NestedObjectWithOptionalFieldError {
                                    message: message,
                                    field: parsed
                                        .get("field")
                                        .and_then(|v| v.as_str().map(|s| s.to_string())),
                                    details: parsed
                                        .get("details")
                                        .and_then(|v| v.as_str().map(|s| s.to_string())),
                                }
                            }
                            Some("NestedObjectWithRequiredFieldError") => {
                                Self::NestedObjectWithRequiredFieldError {
                                    message: message,
                                    field: parsed
                                        .get("field")
                                        .and_then(|v| v.as_str().map(|s| s.to_string())),
                                    details: parsed
                                        .get("details")
                                        .and_then(|v| v.as_str().map(|s| s.to_string())),
                                }
                            }
                            Some("ErrorWithUnionBody") => Self::ErrorWithUnionBody {
                                message: message,
                                field: parsed
                                    .get("field")
                                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                                details: parsed
                                    .get("details")
                                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                            },
                            _ => Self::BadRequestBody {
                                message: message,
                                field: parsed
                                    .get("field")
                                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                                details: parsed
                                    .get("details")
                                    .and_then(|v| v.as_str().map(|s| s.to_string())),
                            },
                        };
                    }
                    return Self::BadRequestBody {
                        message: body.unwrap_or("Unknown error").to_string(),
                        field: None,
                        details: None,
                    };
                }
                return Self::BadRequestBody {
                    message: "Unknown error".to_string(),
                    field: None,
                    details: None,
                };
            }
            _ => Self::Http {
                status: status_code,
                message: body.unwrap_or("Unknown error").to_string(),
            },
        }
    }
}
