pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum WorkspaceSubmissionUpdateInfo {
        #[serde(rename = "running")]
        Running {
            value: RunningSubmissionState,
        },

        #[serde(rename = "ran")]
        Ran {
            #[serde(flatten)]
            data: WorkspaceRunDetails,
        },

        #[serde(rename = "stopped")]
        Stopped,

        #[serde(rename = "traced")]
        Traced,

        #[serde(rename = "tracedV2")]
        TracedV2 {
            #[serde(flatten)]
            data: WorkspaceTracedUpdate,
        },

        #[serde(rename = "errored")]
        Errored {
            value: ErrorInfo,
        },

        #[serde(rename = "finished")]
        Finished,
}
