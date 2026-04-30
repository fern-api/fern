pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum EventTypeEnum {
    GroupCreated,
    UserUpdated,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for EventTypeEnum {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::GroupCreated => serializer.serialize_str("group.created"),
            Self::UserUpdated => serializer.serialize_str("user.updated"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for EventTypeEnum {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "group.created" => Ok(Self::GroupCreated),
            "user.updated" => Ok(Self::UserUpdated),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for EventTypeEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::GroupCreated => write!(f, "group.created"),
            Self::UserUpdated => write!(f, "user.updated"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
