pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionCustomTestCasesUnsupported {
    #[serde(rename = "problemId")]
    pub problem_id: CommonsProblemId,
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionSubmissionId,
}
