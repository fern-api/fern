use crate::execution_session_state::ExecutionSessionState;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetExecutionSessionStateResponse {
    pub states: HashMap<String, ExecutionSessionState>,
    #[serde(rename = "numWarmingInstances")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_warming_instances: Option<i32>,
    #[serde(rename = "warmingSessionIds")]
    pub warming_session_ids: Vec<String>,
}