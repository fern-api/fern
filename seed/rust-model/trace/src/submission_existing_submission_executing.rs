pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ExistingSubmissionExecuting {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
}