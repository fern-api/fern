pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestSubmissionStatus {
    #[serde(rename = "stopped")]
    #[non_exhaustive]
    Stopped {},

    #[serde(rename = "errored")]
    #[non_exhaustive]
    Errored {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<ErrorInfo>,
    },

    #[serde(rename = "running")]
    #[non_exhaustive]
    Running {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<RunningSubmissionState>,
    },

    #[serde(rename = "testCaseIdToState")]
    #[non_exhaustive]
    TestCaseIdToState {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<HashMap<String, SubmissionStatusForTestCase>>,
    },
}

impl TestSubmissionStatus {
    pub fn stopped() -> Self {
        Self::Stopped {}
    }

    pub fn errored() -> Self {
        Self::Errored { value: None }
    }

    pub fn running() -> Self {
        Self::Running { value: None }
    }

    pub fn test_case_id_to_state() -> Self {
        Self::TestCaseIdToState { value: None }
    }

    pub fn errored_with_value(value: ErrorInfo) -> Self {
        Self::Errored { value: Some(value) }
    }

    pub fn running_with_value(value: RunningSubmissionState) -> Self {
        Self::Running { value: Some(value) }
    }

    pub fn test_case_id_to_state_with_value(
        value: HashMap<String, SubmissionStatusForTestCase>,
    ) -> Self {
        Self::TestCaseIdToState { value: Some(value) }
    }
}
