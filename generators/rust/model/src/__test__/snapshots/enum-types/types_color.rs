pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Color {
    Red,
    Green,
    Blue,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for Color {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Red => serializer.serialize_str("RED"),
            Self::Green => serializer.serialize_str("GREEN"),
            Self::Blue => serializer.serialize_str("BLUE"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for Color {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "RED" => Ok(Self::Red),
            "GREEN" => Ok(Self::Green),
            "BLUE" => Ok(Self::Blue),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for Color {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Red => write!(f, "RED"),
            Self::Green => write!(f, "GREEN"),
            Self::Blue => write!(f, "BLUE"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
