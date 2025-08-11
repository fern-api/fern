use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ErrorCategory {
    #[serde(rename = "API_ERROR")]
    ApiError,
    #[serde(rename = "AUTHENTICATION_ERROR")]
    AuthenticationError,
    #[serde(rename = "INVALID_REQUEST_ERROR")]
    InvalidRequestError,
}
impl fmt::Display for ErrorCategory {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ApiError => "API_ERROR",
            Self::AuthenticationError => "AUTHENTICATION_ERROR",
            Self::InvalidRequestError => "INVALID_REQUEST_ERROR",
        };
        write!(f, "{}", s)
    }
}
