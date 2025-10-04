pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestSubmissionUpdate {
    #[serde(rename = "updateTime")]
    pub update_time: DateTime<Utc>,
    #[serde(rename = "updateInfo")]
    pub update_info: TestSubmissionUpdateInfo,
}