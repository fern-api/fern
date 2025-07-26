use thiserror::{Error};

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("BadRequestBody: Bad request - {{message}}")]
    BadRequestBody { message: String, field: Option<String>, details: Option<String> },
    #[error("ErrorWithEnumBody: Bad request - {{message}}")]
    ErrorWithEnumBody { message: String, field: Option<String>, details: Option<String> },
    #[error("ObjectWithOptionalFieldError: Bad request - {{message}}")]
    ObjectWithOptionalFieldError { message: String, field: Option<String>, details: Option<String> },
    #[error("ObjectWithRequiredFieldError: Bad request - {{message}}")]
    ObjectWithRequiredFieldError { message: String, field: Option<String>, details: Option<String> },
    #[error("NestedObjectWithOptionalFieldError: Bad request - {{message}}")]
    NestedObjectWithOptionalFieldError { message: String, field: Option<String>, details: Option<String> },
    #[error("NestedObjectWithRequiredFieldError: Bad request - {{message}}")]
    NestedObjectWithRequiredFieldError { message: String, field: Option<String>, details: Option<String> },
    #[error("ErrorWithUnionBody: Bad request - {{message}}")]
    ErrorWithUnionBody { message: String, field: Option<String>, details: Option<String> },
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
        400 => {
            // Parse error body for BadRequestBody;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::BadRequestBody {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        field: parsed.get("field").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        details: parsed.get("details").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::BadRequestBody {
                message: body.unwrap_or("Unknown error").to_string(),
                field: None,
                details: None
            };
        },
        400 => {
            // Parse error body for ErrorWithEnumBody;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::ErrorWithEnumBody {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        field: parsed.get("field").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        details: parsed.get("details").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::ErrorWithEnumBody {
                message: body.unwrap_or("Unknown error").to_string(),
                field: None,
                details: None
            };
        },
        400 => {
            // Parse error body for ObjectWithOptionalFieldError;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::ObjectWithOptionalFieldError {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        field: parsed.get("field").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        details: parsed.get("details").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::ObjectWithOptionalFieldError {
                message: body.unwrap_or("Unknown error").to_string(),
                field: None,
                details: None
            };
        },
        400 => {
            // Parse error body for ObjectWithRequiredFieldError;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::ObjectWithRequiredFieldError {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        field: parsed.get("field").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        details: parsed.get("details").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::ObjectWithRequiredFieldError {
                message: body.unwrap_or("Unknown error").to_string(),
                field: None,
                details: None
            };
        },
        400 => {
            // Parse error body for NestedObjectWithOptionalFieldError;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::NestedObjectWithOptionalFieldError {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        field: parsed.get("field").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        details: parsed.get("details").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::NestedObjectWithOptionalFieldError {
                message: body.unwrap_or("Unknown error").to_string(),
                field: None,
                details: None
            };
        },
        400 => {
            // Parse error body for NestedObjectWithRequiredFieldError;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::NestedObjectWithRequiredFieldError {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        field: parsed.get("field").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        details: parsed.get("details").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::NestedObjectWithRequiredFieldError {
                message: body.unwrap_or("Unknown error").to_string(),
                field: None,
                details: None
            };
        },
        400 => {
            // Parse error body for ErrorWithUnionBody;
            if let Some(body_str) = body {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                    return Self::ErrorWithUnionBody {
                        message: parsed.get("message").and_then(|v| v.as_str()).unwrap_or("Unknown error").to_string(),
                        field: parsed.get("field").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        details: parsed.get("details").and_then(|v| v.as_str()).map(|s| s.to_string())
                    };
                }
            }
            return Self::ErrorWithUnionBody {
                message: body.unwrap_or("Unknown error").to_string(),
                field: None,
                details: None
            };
        },
        _ => Self::Http {
            status: status_code,
            message: body.unwrap_or("Unknown error").to_string()
        },
    }
}
}