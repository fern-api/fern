pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ErrorCode {
    InternalServerError,
    Unauthorized,
    Forbidden,
    BadRequest,
    Conflict,
    Gone,
    UnprocessableEntity,
    NotImplemented,
    BadGateway,
    ServiceUnavailable,
    Unknown,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for ErrorCode {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::InternalServerError => serializer.serialize_str("INTERNAL_SERVER_ERROR"),
            Self::Unauthorized => serializer.serialize_str("UNAUTHORIZED"),
            Self::Forbidden => serializer.serialize_str("FORBIDDEN"),
            Self::BadRequest => serializer.serialize_str("BAD_REQUEST"),
            Self::Conflict => serializer.serialize_str("CONFLICT"),
            Self::Gone => serializer.serialize_str("GONE"),
            Self::UnprocessableEntity => serializer.serialize_str("UNPROCESSABLE_ENTITY"),
            Self::NotImplemented => serializer.serialize_str("NOT_IMPLEMENTED"),
            Self::BadGateway => serializer.serialize_str("BAD_GATEWAY"),
            Self::ServiceUnavailable => serializer.serialize_str("SERVICE_UNAVAILABLE"),
            Self::Unknown => serializer.serialize_str("Unknown"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for ErrorCode {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "INTERNAL_SERVER_ERROR" => Ok(Self::InternalServerError),
            "UNAUTHORIZED" => Ok(Self::Unauthorized),
            "FORBIDDEN" => Ok(Self::Forbidden),
            "BAD_REQUEST" => Ok(Self::BadRequest),
            "CONFLICT" => Ok(Self::Conflict),
            "GONE" => Ok(Self::Gone),
            "UNPROCESSABLE_ENTITY" => Ok(Self::UnprocessableEntity),
            "NOT_IMPLEMENTED" => Ok(Self::NotImplemented),
            "BAD_GATEWAY" => Ok(Self::BadGateway),
            "SERVICE_UNAVAILABLE" => Ok(Self::ServiceUnavailable),
            "Unknown" => Ok(Self::Unknown),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for ErrorCode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InternalServerError => write!(f, "INTERNAL_SERVER_ERROR"),
            Self::Unauthorized => write!(f, "UNAUTHORIZED"),
            Self::Forbidden => write!(f, "FORBIDDEN"),
            Self::BadRequest => write!(f, "BAD_REQUEST"),
            Self::Conflict => write!(f, "CONFLICT"),
            Self::Gone => write!(f, "GONE"),
            Self::UnprocessableEntity => write!(f, "UNPROCESSABLE_ENTITY"),
            Self::NotImplemented => write!(f, "NOT_IMPLEMENTED"),
            Self::BadGateway => write!(f, "BAD_GATEWAY"),
            Self::ServiceUnavailable => write!(f, "SERVICE_UNAVAILABLE"),
            Self::Unknown => write!(f, "Unknown"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
