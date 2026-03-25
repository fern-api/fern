pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum EnumWithCustom {
    Safe,
    Custom,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for EnumWithCustom {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Safe => serializer.serialize_str("safe"),
            Self::Custom => serializer.serialize_str("Custom"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for EnumWithCustom {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "safe" => Ok(Self::Safe),
            "Custom" => Ok(Self::Custom),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for EnumWithCustom {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Safe => write!(f, "safe"),
            Self::Custom => write!(f, "Custom"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
