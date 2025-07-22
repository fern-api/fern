use thiserror::Error;
use serde::{Deserialize, Serialize};

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum ApiError {
    #[error("BadRequestBody: Validation error in field '{{field:?}}': {{message}}")]
    BadRequestBody { message: String, field: Option<String>, details: Option<String> },
    #[error("ErrorWithEnumBody: Validation error in field '{{field:?}}': {{message}}")]
    ErrorWithEnumBody { message: String, field: Option<String>, details: Option<String> },
    #[error("ObjectWithOptionalFieldError: Validation error in field '{{field:?}}': {{message}}")]
    ObjectWithOptionalFieldError { message: String, field: Option<String>, details: Option<String> },
    #[error("ObjectWithRequiredFieldError: Validation error in field '{{field:?}}': {{message}}")]
    ObjectWithRequiredFieldError { message: String, field: Option<String>, details: Option<String> },
    #[error("NestedObjectWithOptionalFieldError: Validation error in field '{{field:?}}': {{message}}")]
    NestedObjectWithOptionalFieldError { message: String, field: Option<String>, details: Option<String> },
    #[error("NestedObjectWithRequiredFieldError: Validation error in field '{{field:?}}': {{message}}")]
    NestedObjectWithRequiredFieldError { message: String, field: Option<String>, details: Option<String> },
    #[error("ErrorWithUnionBody: Validation error in field '{{field:?}}': {{message}}")]
    ErrorWithUnionBody { message: String, field: Option<String>, details: Option<String> },
    
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
            400 => {
                // Parse error body for BadRequestBody
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::BadRequestBody {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            field: parsed.get("field")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            details: parsed.get("details")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::BadRequestBody {
                    message: body.unwrap_or("Unknown error").to_string(),
                    field: None,
                    details: None,
                }
            },
            400 => {
                // Parse error body for ErrorWithEnumBody
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::ErrorWithEnumBody {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            field: parsed.get("field")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            details: parsed.get("details")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::ErrorWithEnumBody {
                    message: body.unwrap_or("Unknown error").to_string(),
                    field: None,
                    details: None,
                }
            },
            400 => {
                // Parse error body for ObjectWithOptionalFieldError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::ObjectWithOptionalFieldError {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            field: parsed.get("field")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            details: parsed.get("details")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::ObjectWithOptionalFieldError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    field: None,
                    details: None,
                }
            },
            400 => {
                // Parse error body for ObjectWithRequiredFieldError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::ObjectWithRequiredFieldError {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            field: parsed.get("field")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            details: parsed.get("details")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::ObjectWithRequiredFieldError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    field: None,
                    details: None,
                }
            },
            400 => {
                // Parse error body for NestedObjectWithOptionalFieldError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::NestedObjectWithOptionalFieldError {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            field: parsed.get("field")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            details: parsed.get("details")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::NestedObjectWithOptionalFieldError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    field: None,
                    details: None,
                }
            },
            400 => {
                // Parse error body for NestedObjectWithRequiredFieldError
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::NestedObjectWithRequiredFieldError {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            field: parsed.get("field")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            details: parsed.get("details")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::NestedObjectWithRequiredFieldError {
                    message: body.unwrap_or("Unknown error").to_string(),
                    field: None,
                    details: None,
                }
            },
            400 => {
                // Parse error body for ErrorWithUnionBody
                if let Some(body_str) = body {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body_str) {
                        return Self::ErrorWithUnionBody {
                            message: parsed.get("message")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown error")
                                .to_string(),
                            field: parsed.get("field")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            details: parsed.get("details")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                        };
                    }
                }
                Self::ErrorWithUnionBody {
                    message: body.unwrap_or("Unknown error").to_string(),
                    field: None,
                    details: None,
                }
            },
            _ => Self::Http {
                status: status_code,
                message: body.unwrap_or("Unknown error").to_string(),
            },
        }
    }
}
