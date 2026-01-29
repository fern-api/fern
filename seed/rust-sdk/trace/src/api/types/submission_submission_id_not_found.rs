pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionIdNotFound {
    #[serde(rename = "missingSubmissionId")]
    pub missing_submission_id: SubmissionId,
}