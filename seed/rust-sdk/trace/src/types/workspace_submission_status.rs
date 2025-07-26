use crate::error_info::ErrorInfo;
use crate::running_submission_state::RunningSubmissionState;
use crate::workspace_run_details::WorkspaceRunDetails;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum WorkspaceSubmissionStatus {
        Stopped,

        Errored {
            value: ErrorInfo,
        },

        Running {
            value: RunningSubmissionState,
        },

        Ran {
            #[serde(flatten)]
            data: WorkspaceRunDetails,
        },

        Traced {
            #[serde(flatten)]
            data: WorkspaceRunDetails,
        },
}
