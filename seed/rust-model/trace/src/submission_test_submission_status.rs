pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestSubmissionStatus {
        #[serde(rename = "stopped")]
        Stopped,

        #[serde(rename = "errored")]
        Errored {
            value: ErrorInfo,
        },

        #[serde(rename = "running")]
        Running {
            value: RunningSubmissionState,
        },

        #[serde(rename = "testCaseIdToState")]
        TestCaseIdToState {
            value: HashMap<String, SubmissionStatusForTestCase>,
        },
}
