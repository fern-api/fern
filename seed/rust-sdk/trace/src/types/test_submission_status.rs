use crate::error_info::ErrorInfo;
use crate::running_submission_state::RunningSubmissionState;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestSubmissionStatus {
        Stopped,

        Errored {
            value: ErrorInfo,
        },

        Running {
            value: RunningSubmissionState,
        },

        TestCaseIdToState {
            value: HashMap<String, SubmissionStatusForTestCase>,
        },
}
