pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionWorkspaceRanResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionSubmissionId,
    #[serde(rename = "runDetails")]
    pub run_details: SubmissionWorkspaceRunDetails,
}