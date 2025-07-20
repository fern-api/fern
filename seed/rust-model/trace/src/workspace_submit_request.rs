use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceSubmitRequest {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    pub language: Language,
    #[serde(rename = "submissionFiles")]
    pub submission_files: Vec<SubmissionFileInfo>,
    #[serde(rename = "userId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
}