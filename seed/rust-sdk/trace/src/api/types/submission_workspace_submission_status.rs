pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum WorkspaceSubmissionStatus {
    #[serde(rename = "stopped")]
    #[non_exhaustive]
    Stopped {},

    #[serde(rename = "errored")]
    #[non_exhaustive]
    Errored { value: ErrorInfo },

    #[serde(rename = "running")]
    #[non_exhaustive]
    Running { value: RunningSubmissionState },

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

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
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

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
