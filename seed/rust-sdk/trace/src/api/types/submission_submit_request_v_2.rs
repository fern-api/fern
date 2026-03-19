pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmitRequestV2 {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    pub language: Language,
    #[serde(rename = "submissionFiles")]
    #[serde(default)]
    pub submission_files: Vec<SubmissionFileInfo>,
    #[serde(rename = "problemId")]
    #[serde(default)]
    pub problem_id: ProblemId,
    #[serde(rename = "problemVersion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub problem_version: Option<i64>,
    #[serde(rename = "userId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
}
