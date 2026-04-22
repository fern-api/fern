pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum MigrationStatus {
    /// The migration is running.
    Running,
    /// The migration failed.
    Failed,
    Finished,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for MigrationStatus {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Running => serializer.serialize_str("RUNNING"),
            Self::Failed => serializer.serialize_str("FAILED"),
            Self::Finished => serializer.serialize_str("FINISHED"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for MigrationStatus {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "RUNNING" => Ok(Self::Running),
            "FAILED" => Ok(Self::Failed),
            "FINISHED" => Ok(Self::Finished),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for MigrationStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Running => write!(f, "RUNNING"),
            Self::Failed => write!(f, "FAILED"),
            Self::Finished => write!(f, "FINISHED"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
