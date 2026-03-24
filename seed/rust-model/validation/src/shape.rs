pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Shape {
    Square,
    Circle,
    Triangle,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for Shape {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Square => serializer.serialize_str("SQUARE"),
            Self::Circle => serializer.serialize_str("CIRCLE"),
            Self::Triangle => serializer.serialize_str("TRIANGLE"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for Shape {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "SQUARE" => Ok(Self::Square),
            "CIRCLE" => Ok(Self::Circle),
            "TRIANGLE" => Ok(Self::Triangle),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for Shape {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Square => write!(f, "SQUARE"),
            Self::Circle => write!(f, "CIRCLE"),
            Self::Triangle => write!(f, "TRIANGLE"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
