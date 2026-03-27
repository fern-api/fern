pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum EntityEventPayloadEventType {
    Created,
    Updated,
    Deleted,
    Preexisting,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for EntityEventPayloadEventType {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Created => serializer.serialize_str("CREATED"),
            Self::Updated => serializer.serialize_str("UPDATED"),
            Self::Deleted => serializer.serialize_str("DELETED"),
            Self::Preexisting => serializer.serialize_str("PREEXISTING"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for EntityEventPayloadEventType {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "CREATED" => Ok(Self::Created),
            "UPDATED" => Ok(Self::Updated),
            "DELETED" => Ok(Self::Deleted),
            "PREEXISTING" => Ok(Self::Preexisting),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for EntityEventPayloadEventType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Created => write!(f, "CREATED"),
            Self::Updated => write!(f, "UPDATED"),
            Self::Deleted => write!(f, "DELETED"),
            Self::Preexisting => write!(f, "PREEXISTING"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
