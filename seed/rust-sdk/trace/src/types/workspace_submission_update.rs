use crate::workspace_submission_update_info::WorkspaceSubmissionUpdateInfo;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceSubmissionUpdate {
    #[serde(rename = "updateTime")]
    #[serde(with = "chrono::serde::ts_seconds")]
    pub update_time: chrono::DateTime<chrono::Utc>,
    #[serde(rename = "updateInfo")]
    pub update_info: WorkspaceSubmissionUpdateInfo,
}