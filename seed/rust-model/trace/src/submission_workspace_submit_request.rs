pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionWorkspaceSubmitRequest {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionSubmissionId,
    pub language: CommonsLanguage,
    #[serde(rename = "submissionFiles")]
    pub submission_files: Vec<SubmissionSubmissionFileInfo>,
    #[serde(rename = "userId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
}