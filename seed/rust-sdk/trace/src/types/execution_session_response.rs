use crate::language::Language;
use crate::execution_session_status::ExecutionSessionStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ExecutionSessionResponse {
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "executionSessionUrl")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub execution_session_url: Option<String>,
    pub language: Language,
    pub status: ExecutionSessionStatus,
}