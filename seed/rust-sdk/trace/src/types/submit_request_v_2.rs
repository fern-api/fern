use crate::submission_id::SubmissionId;
use crate::language::Language;
use crate::submission_file_info::SubmissionFileInfo;
use crate::problem_id::ProblemId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmitRequestV2 {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    pub language: Language,
    #[serde(rename = "submissionFiles")]
    pub submission_files: Vec<SubmissionFileInfo>,
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "problemVersion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub problem_version: Option<i32>,
    #[serde(rename = "userId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
}