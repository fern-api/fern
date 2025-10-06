pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionTestSubmissionUpdateInfo {
        Running {
            value: SubmissionRunningSubmissionState,
        },

        Stopped,

        Errored {
            value: SubmissionErrorInfo,
        },

        GradedTestCase {
            #[serde(flatten)]
            data: SubmissionGradedTestCaseUpdate,
        },

        RecordedTestCase {
            #[serde(flatten)]
            data: SubmissionRecordedTestCaseUpdate,
        },

        Finished,
}
