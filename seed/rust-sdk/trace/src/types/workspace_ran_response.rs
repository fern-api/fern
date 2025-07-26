use crate::submission_id::SubmissionId;
use crate::workspace_run_details::WorkspaceRunDetails;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceRanResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "runDetails")]
    pub run_details: WorkspaceRunDetails,
}