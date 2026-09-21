pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum CallStatusWebhooksPayloadCallStatus {
    Ringing,
    InProgress,
    Completed,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for CallStatusWebhooksPayloadCallStatus {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Ringing => serializer.serialize_str("ringing"),
            Self::InProgress => serializer.serialize_str("in-progress"),
            Self::Completed => serializer.serialize_str("completed"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for CallStatusWebhooksPayloadCallStatus {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "ringing" => Ok(Self::Ringing),
            "in-progress" => Ok(Self::InProgress),
            "completed" => Ok(Self::Completed),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for CallStatusWebhooksPayloadCallStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Ringing => write!(f, "ringing"),
            Self::InProgress => write!(f, "in-progress"),
            Self::Completed => write!(f, "completed"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
