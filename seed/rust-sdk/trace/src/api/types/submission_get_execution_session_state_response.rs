pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetExecutionSessionStateResponse {
    #[serde(default)]
    pub states: HashMap<String, ExecutionSessionState>,
    #[serde(rename = "numWarmingInstances")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_warming_instances: Option<i64>,
    #[serde(rename = "warmingSessionIds")]
    #[serde(default)]
    pub warming_session_ids: Vec<String>,
}
