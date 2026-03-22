pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestSubmissionStatus {
    #[serde(rename = "stopped")]
    #[non_exhaustive]
    Stopped {},

    #[serde(rename = "errored")]
    #[non_exhaustive]
    Errored { value: ErrorInfo },

    #[serde(rename = "running")]
    #[non_exhaustive]
    Running { value: RunningSubmissionState },

    #[serde(rename = "testCaseIdToState")]
    #[non_exhaustive]
    TestCaseIdToState {
        value: HashMap<String, SubmissionStatusForTestCase>,
    },
}

impl TestSubmissionStatus {
    pub fn stopped() -> Self {
        Self::Stopped {}
    }

    pub fn errored(value: ErrorInfo) -> Self {
        Self::Errored { value }
    }

    pub fn running(value: RunningSubmissionState) -> Self {
        Self::Running { value }
    }

    pub fn test_case_id_to_state(value: HashMap<String, SubmissionStatusForTestCase>) -> Self {
        Self::TestCaseIdToState { value }
    }
}
