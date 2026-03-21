pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StoppedResponse {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
}

impl StoppedResponse {
    pub fn builder() -> StoppedResponseBuilder {
        StoppedResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StoppedResponseBuilder {
    submission_id: Option<SubmissionId>,
}

impl StoppedResponseBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StoppedResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](StoppedResponseBuilder::submission_id)
    pub fn build(self) -> Result<StoppedResponse, BuildError> {
        Ok(StoppedResponse {
            submission_id: self.submission_id.ok_or_else(|| BuildError::missing_field("submission_id"))?,
        })
    }
}
