pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum WorkspaceSubmissionUpdateInfo {
    #[serde(rename = "running")]
    #[non_exhaustive]
    Running { value: RunningSubmissionState },

    #[serde(rename = "ran")]
    #[non_exhaustive]
    Ran {
        #[serde(flatten)]
        data: WorkspaceRunDetails,
    },

    #[serde(rename = "stopped")]
    #[non_exhaustive]
    Stopped {},

    #[serde(rename = "traced")]
    #[non_exhaustive]
    Traced {},

    #[serde(rename = "tracedV2")]
    #[non_exhaustive]
    TracedV2 {
        #[serde(rename = "traceResponsesSize")]
        #[serde(default)]
        trace_responses_size: i64,
    },

    #[serde(rename = "errored")]
    #[non_exhaustive]
    Errored { value: ErrorInfo },

    #[serde(rename = "finished")]
    #[non_exhaustive]
    Finished {},
}

impl WorkspaceSubmissionUpdateInfo {
    pub fn running(value: RunningSubmissionState) -> Self {
        Self::Running { value }
    }

    pub fn ran(data: WorkspaceRunDetails) -> Self {
        Self::Ran { data }
    }

    pub fn stopped() -> Self {
        Self::Stopped {}
    }

    pub fn traced() -> Self {
        Self::Traced {}
    }

    pub fn traced_v2(trace_responses_size: i64) -> Self {
        Self::TracedV2 {
            trace_responses_size,
        }
    }

    pub fn errored(value: ErrorInfo) -> Self {
        Self::Errored { value }
    }

    pub fn finished() -> Self {
        Self::Finished {}
    }
}
