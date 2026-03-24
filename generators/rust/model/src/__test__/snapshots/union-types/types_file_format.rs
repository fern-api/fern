pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum FileFormat {
    JSON,
    Csv,
    XML,
    Yaml,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for FileFormat {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::JSON => serializer.serialize_str("JSON"),
            Self::Csv => serializer.serialize_str("CSV"),
            Self::XML => serializer.serialize_str("XML"),
            Self::Yaml => serializer.serialize_str("YAML"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for FileFormat {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "JSON" => Ok(Self::JSON),
            "CSV" => Ok(Self::Csv),
            "XML" => Ok(Self::XML),
            "YAML" => Ok(Self::Yaml),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for FileFormat {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::JSON => write!(f, "JSON"),
            Self::Csv => write!(f, "CSV"),
            Self::XML => write!(f, "XML"),
            Self::Yaml => write!(f, "YAML"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
