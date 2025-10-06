pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionSubmissionIdNotFound {
    #[serde(rename = "missingSubmissionId")]
    pub missing_submission_id: SubmissionSubmissionId,
}
