pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Language {
    Java,
    Javascript,
    Python,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for Language {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Java => serializer.serialize_str("JAVA"),
            Self::Javascript => serializer.serialize_str("JAVASCRIPT"),
            Self::Python => serializer.serialize_str("PYTHON"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for Language {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "JAVA" => Ok(Self::Java),
            "JAVASCRIPT" => Ok(Self::Javascript),
            "PYTHON" => Ok(Self::Python),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for Language {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Java => write!(f, "JAVA"),
            Self::Javascript => write!(f, "JAVASCRIPT"),
            Self::Python => write!(f, "PYTHON"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
