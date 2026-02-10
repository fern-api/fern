pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestSubmissionUpdateInfo {
        #[serde(rename = "running")]
        Running {
            value: RunningSubmissionState,
        },

        #[serde(rename = "stopped")]
        Stopped,

        #[serde(rename = "errored")]
        Errored {
            value: ErrorInfo,
        },

        #[serde(rename = "gradedTestCase")]
        GradedTestCase {
            #[serde(flatten)]
            data: GradedTestCaseUpdate,
        },

        #[serde(rename = "recordedTestCase")]
        RecordedTestCase {
            #[serde(flatten)]
            data: RecordedTestCaseUpdate,
        },

        #[serde(rename = "finished")]
        Finished,
}
