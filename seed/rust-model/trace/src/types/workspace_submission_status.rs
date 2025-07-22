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
