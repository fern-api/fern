pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct AdminStoreTracedWorkspaceRequest {
    #[serde(rename = "workspaceRunDetails")]
    #[serde(default)]
    pub workspace_run_details: WorkspaceRunDetails,
    #[serde(rename = "traceResponses")]
    #[serde(default)]
    pub trace_responses: Vec<TraceResponse>,
}

impl AdminStoreTracedWorkspaceRequest {
    pub fn builder() -> AdminStoreTracedWorkspaceRequestBuilder {
        <AdminStoreTracedWorkspaceRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AdminStoreTracedWorkspaceRequestBuilder {
    workspace_run_details: Option<WorkspaceRunDetails>,
    trace_responses: Option<Vec<TraceResponse>>,
}

impl AdminStoreTracedWorkspaceRequestBuilder {
    pub fn workspace_run_details(mut self, value: WorkspaceRunDetails) -> Self {
        self.workspace_run_details = Some(value);
        self
    }

    pub fn trace_responses(mut self, value: Vec<TraceResponse>) -> Self {
        self.trace_responses = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`AdminStoreTracedWorkspaceRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`workspace_run_details`](AdminStoreTracedWorkspaceRequestBuilder::workspace_run_details)
    /// - [`trace_responses`](AdminStoreTracedWorkspaceRequestBuilder::trace_responses)
    pub fn build(self) -> Result<AdminStoreTracedWorkspaceRequest, BuildError> {
        Ok(AdminStoreTracedWorkspaceRequest {
            workspace_run_details: self.workspace_run_details.ok_or_else(|| BuildError::missing_field("workspace_run_details"))?,
            trace_responses: self.trace_responses.ok_or_else(|| BuildError::missing_field("trace_responses"))?,
        })
    }
}

