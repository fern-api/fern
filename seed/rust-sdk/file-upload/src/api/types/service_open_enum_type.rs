pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum OpenEnumType {
    OptionA,
    OptionB,
    OptionC,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for OpenEnumType {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::OptionA => serializer.serialize_str("OPTION_A"),
            Self::OptionB => serializer.serialize_str("OPTION_B"),
            Self::OptionC => serializer.serialize_str("OPTION_C"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for OpenEnumType {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "OPTION_A" => Ok(Self::OptionA),
            "OPTION_B" => Ok(Self::OptionB),
            "OPTION_C" => Ok(Self::OptionC),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for OpenEnumType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::OptionA => write!(f, "OPTION_A"),
            Self::OptionB => write!(f, "OPTION_B"),
            Self::OptionC => write!(f, "OPTION_C"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
