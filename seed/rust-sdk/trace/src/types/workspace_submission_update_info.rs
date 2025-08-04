use crate::running_submission_state::RunningSubmissionState;
use crate::workspace_run_details::WorkspaceRunDetails;
use crate::workspace_traced_update::WorkspaceTracedUpdate;
use crate::error_info::ErrorInfo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum WorkspaceSubmissionUpdateInfo {
        Running {
            value: RunningSubmissionState,
        },

        Ran {
            #[serde(flatten)]
            data: WorkspaceRunDetails,
        },

        Stopped,

        Traced,

        TracedV2 {
            #[serde(flatten)]
            data: WorkspaceTracedUpdate,
        },

        Errored {
            value: ErrorInfo,
        },

        Finished,
}
