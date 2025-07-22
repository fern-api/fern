use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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