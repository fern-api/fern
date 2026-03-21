pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FinishedResponse {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
}

impl FinishedResponse {
    pub fn builder() -> FinishedResponseBuilder {
        FinishedResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FinishedResponseBuilder {
    submission_id: Option<SubmissionId>,
}

impl FinishedResponseBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FinishedResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](FinishedResponseBuilder::submission_id)
    pub fn build(self) -> Result<FinishedResponse, BuildError> {
        Ok(FinishedResponse {
            submission_id: self.submission_id.ok_or_else(|| BuildError::missing_field("submission_id"))?,
        })
    }
}
