pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum WorkspaceSubmissionStatus {
        #[serde(rename = "stopped")]
        Stopped,

        #[serde(rename = "errored")]
        Errored {
            value: ErrorInfo,
        },

        #[serde(rename = "running")]
        Running {
            value: RunningSubmissionState,
        },

        #[serde(rename = "ran")]
        Ran {
            #[serde(flatten)]
            data: WorkspaceRunDetails,
        },

        #[serde(rename = "traced")]
        Traced {
            #[serde(flatten)]
            data: WorkspaceRunDetails,
        },
}
