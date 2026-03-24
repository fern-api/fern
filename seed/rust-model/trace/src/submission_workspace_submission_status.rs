pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum WorkspaceSubmissionStatus {
        #[serde(rename = "stopped")]
        #[non_exhaustive]
        Stopped {},

        #[serde(rename = "errored")]
        #[non_exhaustive]
        Errored {
            value: ErrorInfo,
        },

        #[serde(rename = "running")]
        #[non_exhaustive]
        Running {
            value: RunningSubmissionState,
        },

        #[serde(rename = "ran")]
        #[non_exhaustive]
        Ran {
            #[serde(flatten)]
            data: WorkspaceRunDetails,
        },

        #[serde(rename = "traced")]
        #[non_exhaustive]
        Traced {
            #[serde(flatten)]
            data: WorkspaceRunDetails,
        },
}

impl WorkspaceSubmissionStatus {
    pub fn stopped() -> Self {
        Self::Stopped {}
    }

    pub fn errored(value: ErrorInfo) -> Self {
        Self::Errored { value }
    }

    pub fn running(value: RunningSubmissionState) -> Self {
        Self::Running { value }
    }

    pub fn ran(data: WorkspaceRunDetails) -> Self {
        Self::Ran { data }
    }

    pub fn traced(data: WorkspaceRunDetails) -> Self {
        Self::Traced { data }
    }
}
