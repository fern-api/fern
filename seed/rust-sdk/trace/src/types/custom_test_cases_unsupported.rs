use crate::problem_id::ProblemId;
use crate::submission_id::SubmissionId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CustomTestCasesUnsupported {
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
}