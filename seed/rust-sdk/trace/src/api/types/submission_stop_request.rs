pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StopRequest {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
}

impl StopRequest {
    pub fn builder() -> StopRequestBuilder {
        StopRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StopRequestBuilder {
    submission_id: Option<SubmissionId>,
}

impl StopRequestBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StopRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](StopRequestBuilder::submission_id)
    pub fn build(self) -> Result<StopRequest, BuildError> {
        Ok(StopRequest {
            submission_id: self
                .submission_id
                .ok_or_else(|| BuildError::missing_field("submission_id"))?,
        })
    }
}
