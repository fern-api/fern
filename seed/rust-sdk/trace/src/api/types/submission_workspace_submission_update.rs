use crate::submission_workspace_submission_update_info::WorkspaceSubmissionUpdateInfo;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceSubmissionUpdate {
    #[serde(rename = "updateTime")]
    pub update_time: DateTime<Utc>,
    #[serde(rename = "updateInfo")]
    pub update_info: WorkspaceSubmissionUpdateInfo,
}
