pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionGradedResponseV2 {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionSubmissionId,
    #[serde(rename = "testCases")]
    pub test_cases: HashMap<V2ProblemTestCaseId, SubmissionTestCaseGrade>,
}
