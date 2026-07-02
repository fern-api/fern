pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum LoadRequestCache {
    StaleIfSlow,
    NoCache,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for LoadRequestCache {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::StaleIfSlow => serializer.serialize_str("stale-if-slow"),
            Self::NoCache => serializer.serialize_str("no-cache"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for LoadRequestCache {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "stale-if-slow" => Ok(Self::StaleIfSlow),
            "no-cache" => Ok(Self::NoCache),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for LoadRequestCache {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::StaleIfSlow => write!(f, "stale-if-slow"),
            Self::NoCache => write!(f, "no-cache"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
