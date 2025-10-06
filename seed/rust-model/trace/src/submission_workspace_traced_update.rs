pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionWorkspaceTracedUpdate {
    #[serde(rename = "traceResponsesSize")]
    pub trace_responses_size: i64,
}