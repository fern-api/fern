pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionWorkspaceSubmissionUpdate {
    #[serde(rename = "updateTime")]
    pub update_time: DateTime<Utc>,
    #[serde(rename = "updateInfo")]
    pub update_info: SubmissionWorkspaceSubmissionUpdateInfo,
}