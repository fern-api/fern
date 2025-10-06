pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionWorkspaceSubmissionUpdateInfo {
        Running {
            value: SubmissionRunningSubmissionState,
        },

        Ran {
            #[serde(flatten)]
            data: SubmissionWorkspaceRunDetails,
        },

        Stopped,

        Traced,

        TracedV2 {
            #[serde(flatten)]
            data: SubmissionWorkspaceTracedUpdate,
        },

        Errored {
            value: SubmissionErrorInfo,
        },

        Finished,
}
