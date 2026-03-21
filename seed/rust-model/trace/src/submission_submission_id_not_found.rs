pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SubmissionIdNotFound {
    #[serde(rename = "missingSubmissionId")]
    #[serde(default)]
    pub missing_submission_id: SubmissionId,
}

impl SubmissionIdNotFound {
    pub fn builder() -> SubmissionIdNotFoundBuilder {
        SubmissionIdNotFoundBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionIdNotFoundBuilder {
    missing_submission_id: Option<SubmissionId>,
}

impl SubmissionIdNotFoundBuilder {
    pub fn missing_submission_id(mut self, value: SubmissionId) -> Self {
        self.missing_submission_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionIdNotFound`].
    /// This method will fail if any of the following fields are not set:
    /// - [`missing_submission_id`](SubmissionIdNotFoundBuilder::missing_submission_id)
    pub fn build(self) -> Result<SubmissionIdNotFound, BuildError> {
        Ok(SubmissionIdNotFound {
            missing_submission_id: self.missing_submission_id.ok_or_else(|| BuildError::missing_field("missing_submission_id"))?,
        })
    }
}
