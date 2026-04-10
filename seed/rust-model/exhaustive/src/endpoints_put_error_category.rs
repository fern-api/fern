pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ErrorCategory {
    ApiError,
    AuthenticationError,
    InvalidRequestError,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for ErrorCategory {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::ApiError => serializer.serialize_str("API_ERROR"),
            Self::AuthenticationError => serializer.serialize_str("AUTHENTICATION_ERROR"),
            Self::InvalidRequestError => serializer.serialize_str("INVALID_REQUEST_ERROR"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for ErrorCategory {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "API_ERROR" => Ok(Self::ApiError),
            "AUTHENTICATION_ERROR" => Ok(Self::AuthenticationError),
            "INVALID_REQUEST_ERROR" => Ok(Self::InvalidRequestError),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for ErrorCategory {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::ApiError => write!(f, "API_ERROR"),
            Self::AuthenticationError => write!(f, "AUTHENTICATION_ERROR"),
            Self::InvalidRequestError => write!(f, "INVALID_REQUEST_ERROR"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
