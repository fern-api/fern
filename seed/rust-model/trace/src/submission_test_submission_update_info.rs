pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestSubmissionUpdateInfo {
        Running {
            value: RunningSubmissionState,
        },

        Stopped,

        Errored {
            value: ErrorInfo,
        },

        GradedTestCase {
            #[serde(flatten)]
            data: GradedTestCaseUpdate,
        },

        RecordedTestCase {
            #[serde(flatten)]
            data: RecordedTestCaseUpdate,
        },

        Finished,
}
