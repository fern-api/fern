pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionExecutionSessionResponse {
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "executionSessionUrl")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub execution_session_url: Option<String>,
    pub language: CommonsLanguage,
    pub status: SubmissionExecutionSessionStatus,
}