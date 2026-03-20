pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct StoreTracedWorkspaceRequest {
    #[serde(rename = "workspaceRunDetails")]
    #[serde(default)]
    pub workspace_run_details: WorkspaceRunDetails,
    #[serde(rename = "traceResponses")]
    #[serde(default)]
    pub trace_responses: Vec<TraceResponse>,
}
