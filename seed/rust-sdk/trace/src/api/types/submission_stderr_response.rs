pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StderrResponse {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    #[serde(default)]
    pub stderr: String,
}

impl StderrResponse {
    pub fn builder() -> StderrResponseBuilder {
        <StderrResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StderrResponseBuilder {
    submission_id: Option<SubmissionId>,
    stderr: Option<String>,
}

impl StderrResponseBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn stderr(mut self, value: impl Into<String>) -> Self {
        self.stderr = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StderrResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](StderrResponseBuilder::submission_id)
    /// - [`stderr`](StderrResponseBuilder::stderr)
    pub fn build(self) -> Result<StderrResponse, BuildError> {
        Ok(StderrResponse {
            submission_id: self
                .submission_id
                .ok_or_else(|| BuildError::missing_field("submission_id"))?,
            stderr: self
                .stderr
                .ok_or_else(|| BuildError::missing_field("stderr"))?,
        })
    }
}
