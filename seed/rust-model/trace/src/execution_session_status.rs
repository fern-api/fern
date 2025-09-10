use serde::{Deserialize, Serialize};

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