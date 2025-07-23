use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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
