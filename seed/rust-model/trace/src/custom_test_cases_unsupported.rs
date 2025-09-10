use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CustomTestCasesUnsupported {
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
}