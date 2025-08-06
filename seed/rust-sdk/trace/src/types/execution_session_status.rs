use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ExecutionSessionStatus {
    #[serde(rename = "CREATING_CONTAINER")]
    CreatingContainer,
    #[serde(rename = "PROVISIONING_CONTAINER")]
    ProvisioningContainer,
    #[serde(rename = "PENDING_CONTAINER")]
    PendingContainer,
    #[serde(rename = "RUNNING_CONTAINER")]
    RunningContainer,
    #[serde(rename = "LIVE_CONTAINER")]
    LiveContainer,
    #[serde(rename = "FAILED_TO_LAUNCH")]
    FailedToLaunch,
}
impl fmt::Display for ExecutionSessionStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::CreatingContainer => "CREATING_CONTAINER",
            Self::ProvisioningContainer => "PROVISIONING_CONTAINER",
            Self::PendingContainer => "PENDING_CONTAINER",
            Self::RunningContainer => "RUNNING_CONTAINER",
            Self::LiveContainer => "LIVE_CONTAINER",
            Self::FailedToLaunch => "FAILED_TO_LAUNCH",
        };
        write!(f, "{}", s)
    }
}
