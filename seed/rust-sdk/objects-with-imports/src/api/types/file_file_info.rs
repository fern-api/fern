pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum FileInfo {
    /// A regular file (e.g. foo.txt).
    Regular,
    /// A directory (e.g. foo/).
    Directory,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for FileInfo {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Regular => serializer.serialize_str("REGULAR"),
            Self::Directory => serializer.serialize_str("DIRECTORY"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for FileInfo {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "REGULAR" => Ok(Self::Regular),
            "DIRECTORY" => Ok(Self::Directory),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for FileInfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Regular => write!(f, "REGULAR"),
            Self::Directory => write!(f, "DIRECTORY"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
