use crate::running_submission_state::RunningSubmissionState;
use crate::error_info::ErrorInfo;
use crate::graded_test_case_update::GradedTestCaseUpdate;
use crate::recorded_test_case_update::RecordedTestCaseUpdate;
use serde::{Deserialize, Serialize};

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
