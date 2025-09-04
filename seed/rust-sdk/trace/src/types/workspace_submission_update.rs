use crate::workspace_submission_update_info::WorkspaceSubmissionUpdateInfo;
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceSubmissionUpdate {
    #[serde(rename = "updateTime")]
    pub update_time: chrono::DateTime<chrono::Utc>,
    #[serde(rename = "updateInfo")]
    pub update_info: WorkspaceSubmissionUpdateInfo,
}