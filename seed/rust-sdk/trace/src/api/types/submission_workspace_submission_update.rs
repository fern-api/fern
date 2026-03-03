pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceSubmissionUpdate {
    #[serde(rename = "updateTime")]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub update_time: DateTime<FixedOffset>,
    #[serde(rename = "updateInfo")]
    pub update_info: WorkspaceSubmissionUpdateInfo,
}
