use crate::submission_trace_response::TraceResponse;
use crate::submission_workspace_run_details::WorkspaceRunDetails;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoreTracedWorkspaceRequest {
    #[serde(rename = "workspaceRunDetails")]
    pub workspace_run_details: WorkspaceRunDetails,
    #[serde(rename = "traceResponses")]
    pub trace_responses: Vec<TraceResponse>,
}
