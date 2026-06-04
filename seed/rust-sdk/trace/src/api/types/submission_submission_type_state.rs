pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum SubmissionTypeState {
    #[serde(rename = "test")]
    #[non_exhaustive]
    Test {
        #[serde(rename = "problemId")]
        #[serde(default)]
        problem_id: ProblemId,
        #[serde(rename = "defaultTestCases")]
        #[serde(default)]
        default_test_cases: Vec<TestCase>,
        #[serde(rename = "customTestCases")]
        #[serde(default)]
        custom_test_cases: Vec<TestCase>,
        status: TestSubmissionStatus,
    },

    #[serde(rename = "workspace")]
    #[non_exhaustive]
    Workspace { status: WorkspaceSubmissionStatus },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl SubmissionTypeState {
    pub fn test(
        problem_id: ProblemId,
        default_test_cases: Vec<TestCase>,
        custom_test_cases: Vec<TestCase>,
        status: TestSubmissionStatus,
    ) -> Self {
        Self::Test {
            problem_id,
            default_test_cases,
            custom_test_cases,
            status,
        }
    }

    pub fn workspace(status: WorkspaceSubmissionStatus) -> Self {
        Self::Workspace { status }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
