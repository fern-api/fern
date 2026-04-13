pub use crate::prelude::*;

/// Test enum for nullable enum fields
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum UserRole {
    Admin,
    User,
    Guest,
    Moderator,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for UserRole {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Admin => serializer.serialize_str("ADMIN"),
            Self::User => serializer.serialize_str("USER"),
            Self::Guest => serializer.serialize_str("GUEST"),
            Self::Moderator => serializer.serialize_str("MODERATOR"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for UserRole {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "ADMIN" => Ok(Self::Admin),
            "USER" => Ok(Self::User),
            "GUEST" => Ok(Self::Guest),
            "MODERATOR" => Ok(Self::Moderator),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for UserRole {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Admin => write!(f, "ADMIN"),
            Self::User => write!(f, "USER"),
            Self::Guest => write!(f, "GUEST"),
            Self::Moderator => write!(f, "MODERATOR"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
