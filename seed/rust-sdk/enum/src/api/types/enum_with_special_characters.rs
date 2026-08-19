pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum EnumWithSpecialCharacters {
    Bla,
    Yo,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for EnumWithSpecialCharacters {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Bla => serializer.serialize_str("\\$bla"),
            Self::Yo => serializer.serialize_str("\\$yo"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for EnumWithSpecialCharacters {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "\\$bla" => Ok(Self::Bla),
            "\\$yo" => Ok(Self::Yo),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for EnumWithSpecialCharacters {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Bla => write!(f, "\\$bla"),
            Self::Yo => write!(f, "\\$yo"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
