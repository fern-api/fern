pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionSubmitRequestV2 {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionSubmissionId,
    pub language: CommonsLanguage,
    #[serde(rename = "submissionFiles")]
    pub submission_files: Vec<SubmissionSubmissionFileInfo>,
    #[serde(rename = "problemId")]
    pub problem_id: CommonsProblemId,
    #[serde(rename = "problemVersion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub problem_version: Option<i64>,
    #[serde(rename = "userId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
}