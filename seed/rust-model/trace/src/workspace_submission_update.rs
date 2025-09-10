use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceSubmissionUpdate {
    #[serde(rename = "updateTime")]
    #[serde(with = "chrono::serde::ts_seconds")]
    pub update_time: chrono::DateTime<chrono::Utc>,
    #[serde(rename = "updateInfo")]
    pub update_info: WorkspaceSubmissionUpdateInfo,
}