pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionTestSubmissionStatus {
        Stopped,

        Errored {
            value: SubmissionErrorInfo,
        },

        Running {
            value: SubmissionRunningSubmissionState,
        },

        TestCaseIdToState {
            value: HashMap<String, SubmissionSubmissionStatusForTestCase>,
        },
}
