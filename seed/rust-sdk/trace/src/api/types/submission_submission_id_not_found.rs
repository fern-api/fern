pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SubmissionIdNotFound {
    #[serde(rename = "missingSubmissionId")]
    #[serde(default)]
    pub missing_submission_id: SubmissionId,
}
