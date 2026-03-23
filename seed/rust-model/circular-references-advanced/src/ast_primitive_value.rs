pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum PrimitiveValue {
    String,
    Number,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for PrimitiveValue {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::String => serializer.serialize_str("STRING"),
            Self::Number => serializer.serialize_str("NUMBER"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for PrimitiveValue {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "STRING" => Ok(Self::String),
            "NUMBER" => Ok(Self::Number),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for PrimitiveValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::String => write!(f, "STRING"),
            Self::Number => write!(f, "NUMBER"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
