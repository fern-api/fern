use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("BadRequestBody: Bad request - {message}")]
    BadRequestBody { message: String },
    #[error("ErrorWithEnumBody: Bad request - {message}")]
    ErrorWithEnumBody {
        message: String,
        field: Option<String>,
        details: Option<String>,
    },
    #[error("ObjectWithOptionalFieldError: Bad request - {message}")]
    ObjectWithOptionalFieldError {
        message: String,
        string: Option<String>,
        integer: Option<i64>,
        long: Option<i64>,
        double: Option<f64>,
        bool_: Option<bool>,
        datetime: Option<DateTime<FixedOffset>>,
        date: Option<NaiveDate>,
        uuid: Option<Uuid>,
        base64: Option<Vec<u8>>,
        list: Option<Vec<String>>,
        set: Option<HashSet<String>>,
        map: Option<HashMap<i64, String>>,
        bigint: Option<num_bigint::BigInt>,
    },
    #[error("ObjectWithRequiredFieldError: Bad request - {message}")]
    ObjectWithRequiredFieldError {
        message: String,
        string: Option<String>,
    },
    #[error("NestedObjectWithOptionalFieldError: Bad request - {message}")]
    NestedObjectWithOptionalFieldError {
        message: String,
        string: Option<String>,
        nested_object: Option<ObjectWithOptionalField>,
    },
    #[error("NestedObjectWithRequiredFieldError: Bad request - {message}")]
    NestedObjectWithRequiredFieldError {
        message: String,
        string: Option<String>,
        nested_object: Option<ObjectWithOptionalField>,
    },
    #[error("ErrorWithUnionBody: Bad request - {message}")]
    ErrorWithUnionBody {
        message: String,
        field: Option<String>,
        details: Option<String>,
    },
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
                            Some("BadRequestBody") => Self::BadRequestBody { message: message },
                            Some("ErrorWithEnumBody") => {
                                Self::ErrorWithEnumBody { message: message }
                            }
                            Some("ObjectWithOptionalFieldError") => {
                                Self::ObjectWithOptionalFieldError { message: message }
                            }
                            Some("ObjectWithRequiredFieldError") => {
                                Self::ObjectWithRequiredFieldError { message: message }
                            }
                            Some("NestedObjectWithOptionalFieldError") => {
                                Self::NestedObjectWithOptionalFieldError { message: message }
                            }
                            Some("NestedObjectWithRequiredFieldError") => {
                                Self::NestedObjectWithRequiredFieldError { message: message }
                            }
                            Some("ErrorWithUnionBody") => {
                                Self::ErrorWithUnionBody { message: message }
                            }
                            _ => Self::BadRequestBody { message: message },
                        };
                    }
                    return Self::BadRequestBody {
                        message: body.unwrap_or("Unknown error").to_string(),
                    };
                }
                return Self::BadRequestBody {
                    message: "Unknown error".to_string(),
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
