use crate::submission_test_submission_update_info::TestSubmissionUpdateInfo;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSubmissionUpdate {
    #[serde(rename = "updateTime")]
    pub update_time: DateTime<Utc>,
    #[serde(rename = "updateInfo")]
    pub update_info: TestSubmissionUpdateInfo,
}
