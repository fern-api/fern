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
