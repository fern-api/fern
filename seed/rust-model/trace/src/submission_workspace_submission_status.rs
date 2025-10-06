pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionWorkspaceSubmissionStatus {
        Stopped,

        Errored {
            value: SubmissionErrorInfo,
        },

        Running {
            value: SubmissionRunningSubmissionState,
        },

        Ran {
            #[serde(flatten)]
            data: SubmissionWorkspaceRunDetails,
        },

        Traced {
            #[serde(flatten)]
            data: SubmissionWorkspaceRunDetails,
        },
}
