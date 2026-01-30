pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StopRequest {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
}