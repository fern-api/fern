pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ReservedKeywordEnum {
    Is,
    As,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for ReservedKeywordEnum {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Is => serializer.serialize_str("is"),
            Self::As => serializer.serialize_str("as"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for ReservedKeywordEnum {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "is" => Ok(Self::Is),
            "as" => Ok(Self::As),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for ReservedKeywordEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Is => write!(f, "is"),
            Self::As => write!(f, "as"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
