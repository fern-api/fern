pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionExecutionSessionState {
    #[serde(rename = "lastTimeContacted")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_time_contacted: Option<String>,
    /// The auto-generated session id. Formatted as a uuid.
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "isWarmInstance")]
    pub is_warm_instance: bool,
    #[serde(rename = "awsTaskId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub aws_task_id: Option<String>,
    pub language: CommonsLanguage,
    pub status: SubmissionExecutionSessionStatus,
}
