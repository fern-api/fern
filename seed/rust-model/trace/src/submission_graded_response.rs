pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GradedResponse {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    #[serde(rename = "testCases")]
    #[serde(default)]
    pub test_cases: HashMap<String, TestCaseResultWithStdout>,
}