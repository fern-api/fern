use crate::submission_error_info::ErrorInfo;
use crate::submission_graded_test_case_update::GradedTestCaseUpdate;
use crate::submission_recorded_test_case_update::RecordedTestCaseUpdate;
use crate::submission_running_submission_state::RunningSubmissionState;
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
