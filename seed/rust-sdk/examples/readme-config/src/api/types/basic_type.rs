pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum BasicType {
    Primitive,
    Literal,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for BasicType {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Primitive => serializer.serialize_str("primitive"),
            Self::Literal => serializer.serialize_str("literal"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for BasicType {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "primitive" => Ok(Self::Primitive),
            "literal" => Ok(Self::Literal),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for BasicType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Primitive => write!(f, "primitive"),
            Self::Literal => write!(f, "literal"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
