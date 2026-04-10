pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ExistingSubmissionExecuting {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
}

impl ExistingSubmissionExecuting {
    pub fn builder() -> ExistingSubmissionExecutingBuilder {
        <ExistingSubmissionExecutingBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExistingSubmissionExecutingBuilder {
    submission_id: Option<SubmissionId>,
}

impl ExistingSubmissionExecutingBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ExistingSubmissionExecuting`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](ExistingSubmissionExecutingBuilder::submission_id)
    pub fn build(self) -> Result<ExistingSubmissionExecuting, BuildError> {
        Ok(ExistingSubmissionExecuting {
            submission_id: self.submission_id.ok_or_else(|| BuildError::missing_field("submission_id"))?,
        })
    }
}
