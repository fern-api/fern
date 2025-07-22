use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ExecutionSessionState {
    #[serde(rename = "lastTimeContacted")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_time_contacted: Option<String>,
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "isWarmInstance")]
    pub is_warm_instance: bool,
    #[serde(rename = "awsTaskId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub aws_task_id: Option<String>,
    pub language: Language,
    pub status: ExecutionSessionStatus,
}