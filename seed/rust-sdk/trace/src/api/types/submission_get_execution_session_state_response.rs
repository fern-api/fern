pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionGetExecutionSessionStateResponse {
    pub states: HashMap<String, SubmissionExecutionSessionState>,
    #[serde(rename = "numWarmingInstances")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_warming_instances: Option<i64>,
    #[serde(rename = "warmingSessionIds")]
    pub warming_session_ids: Vec<String>,
}
