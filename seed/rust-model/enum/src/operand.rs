pub use crate::prelude::*;

/// Tests enum name and value can be
/// different.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Operand {
    GreaterThan,
    EqualTo,
    /// The name and value should be similar
    /// are similar for less than.
    LessThan,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for Operand {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::GreaterThan => serializer.serialize_str(">"),
            Self::EqualTo => serializer.serialize_str("="),
            Self::LessThan => serializer.serialize_str("less_than"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for Operand {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            ">" => Ok(Self::GreaterThan),
            "=" => Ok(Self::EqualTo),
            "less_than" => Ok(Self::LessThan),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for Operand {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::GreaterThan => write!(f, ">"),
            Self::EqualTo => write!(f, "="),
            Self::LessThan => write!(f, "less_than"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
