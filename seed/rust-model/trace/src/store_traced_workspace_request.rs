pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StoreTracedWorkspaceRequest {
    #[serde(rename = "workspaceRunDetails")]
    pub workspace_run_details: WorkspaceRunDetails,
    #[serde(rename = "traceResponses")]
    pub trace_responses: Vec<TraceResponse>,
}
