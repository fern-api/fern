use crate::initialize_problem_request::InitializeProblemRequest;
use crate::submit_request_v_2::SubmitRequestV2;
use crate::workspace_submit_request::WorkspaceSubmitRequest;
use crate::stop_request::StopRequest;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionRequest {
        InitializeProblemRequest {
            #[serde(flatten)]
            data: InitializeProblemRequest,
        },

        InitializeWorkspaceRequest,

        SubmitV2 {
            #[serde(flatten)]
            data: SubmitRequestV2,
        },

        WorkspaceSubmit {
            #[serde(flatten)]
            data: WorkspaceSubmitRequest,
        },

        Stop {
            #[serde(flatten)]
            data: StopRequest,
        },
}
