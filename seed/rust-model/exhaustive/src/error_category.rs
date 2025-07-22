use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ErrorCategory {
    #[serde(rename = "API_ERROR")]
    ApiError,
    #[serde(rename = "AUTHENTICATION_ERROR")]
    AuthenticationError,
    #[serde(rename = "INVALID_REQUEST_ERROR")]
    InvalidRequestError,
}