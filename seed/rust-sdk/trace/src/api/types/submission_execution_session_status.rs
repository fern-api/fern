pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ExecutionSessionStatus {
    CreatingContainer,
    ProvisioningContainer,
    PendingContainer,
    RunningContainer,
    LiveContainer,
    FailedToLaunch,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for ExecutionSessionStatus {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::CreatingContainer => serializer.serialize_str("CREATING_CONTAINER"),
            Self::ProvisioningContainer => serializer.serialize_str("PROVISIONING_CONTAINER"),
            Self::PendingContainer => serializer.serialize_str("PENDING_CONTAINER"),
            Self::RunningContainer => serializer.serialize_str("RUNNING_CONTAINER"),
            Self::LiveContainer => serializer.serialize_str("LIVE_CONTAINER"),
            Self::FailedToLaunch => serializer.serialize_str("FAILED_TO_LAUNCH"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for ExecutionSessionStatus {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "CREATING_CONTAINER" => Ok(Self::CreatingContainer),
            "PROVISIONING_CONTAINER" => Ok(Self::ProvisioningContainer),
            "PENDING_CONTAINER" => Ok(Self::PendingContainer),
            "RUNNING_CONTAINER" => Ok(Self::RunningContainer),
            "LIVE_CONTAINER" => Ok(Self::LiveContainer),
            "FAILED_TO_LAUNCH" => Ok(Self::FailedToLaunch),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for ExecutionSessionStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::CreatingContainer => write!(f, "CREATING_CONTAINER"),
            Self::ProvisioningContainer => write!(f, "PROVISIONING_CONTAINER"),
            Self::PendingContainer => write!(f, "PENDING_CONTAINER"),
            Self::RunningContainer => write!(f, "RUNNING_CONTAINER"),
            Self::LiveContainer => write!(f, "LIVE_CONTAINER"),
            Self::FailedToLaunch => write!(f, "FAILED_TO_LAUNCH"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
