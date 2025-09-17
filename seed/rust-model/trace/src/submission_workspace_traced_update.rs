use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceTracedUpdate {
    #[serde(rename = "traceResponsesSize")]
    pub trace_responses_size: i32,
}