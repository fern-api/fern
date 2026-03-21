pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WorkspaceTracedUpdate {
    #[serde(rename = "traceResponsesSize")]
    #[serde(default)]
    pub trace_responses_size: i64,
}
