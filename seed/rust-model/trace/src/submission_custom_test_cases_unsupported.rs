pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CustomTestCasesUnsupported {
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
}