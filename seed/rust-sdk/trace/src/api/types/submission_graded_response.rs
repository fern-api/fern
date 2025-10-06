pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionGradedResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionSubmissionId,
    #[serde(rename = "testCases")]
    pub test_cases: HashMap<String, SubmissionTestCaseResultWithStdout>,
}
