use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ErrorCode {
    #[serde(rename = "INTERNAL_SERVER_ERROR")]
    InternalServerError,
    #[serde(rename = "UNAUTHORIZED")]
    Unauthorized,
    #[serde(rename = "FORBIDDEN")]
    Forbidden,
    #[serde(rename = "BAD_REQUEST")]
    BadRequest,
    #[serde(rename = "CONFLICT")]
    Conflict,
    #[serde(rename = "GONE")]
    Gone,
    #[serde(rename = "UNPROCESSABLE_ENTITY")]
    UnprocessableEntity,
    #[serde(rename = "NOT_IMPLEMENTED")]
    NotImplemented,
    #[serde(rename = "BAD_GATEWAY")]
    BadGateway,
    #[serde(rename = "SERVICE_UNAVAILABLE")]
    ServiceUnavailable,
    Unknown,
}
impl fmt::Display for ErrorCode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::InternalServerError => "INTERNAL_SERVER_ERROR",
            Self::Unauthorized => "UNAUTHORIZED",
            Self::Forbidden => "FORBIDDEN",
            Self::BadRequest => "BAD_REQUEST",
            Self::Conflict => "CONFLICT",
            Self::Gone => "GONE",
            Self::UnprocessableEntity => "UNPROCESSABLE_ENTITY",
            Self::NotImplemented => "NOT_IMPLEMENTED",
            Self::BadGateway => "BAD_GATEWAY",
            Self::ServiceUnavailable => "SERVICE_UNAVAILABLE",
            Self::Unknown => "Unknown",
        };
        write!(f, "{}", s)
    }
}
