use crate::submission_error_info::ErrorInfo;
use crate::submission_running_submission_state::RunningSubmissionState;
use crate::submission_workspace_run_details::WorkspaceRunDetails;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
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
