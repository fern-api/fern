pub use crate::prelude::*;

/// Required sun exposure level.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum PlantPostSunExposure {
    Full,
    Partial,
    Shade,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for PlantPostSunExposure {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Full => serializer.serialize_str("full"),
            Self::Partial => serializer.serialize_str("partial"),
            Self::Shade => serializer.serialize_str("shade"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for PlantPostSunExposure {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "full" => Ok(Self::Full),
            "partial" => Ok(Self::Partial),
            "shade" => Ok(Self::Shade),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for PlantPostSunExposure {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Full => write!(f, "full"),
            Self::Partial => write!(f, "partial"),
            Self::Shade => write!(f, "shade"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
