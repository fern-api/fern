pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StdoutResponse {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    #[serde(default)]
    pub stdout: String,
}

impl StdoutResponse {
    pub fn builder() -> StdoutResponseBuilder {
        <StdoutResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StdoutResponseBuilder {
    submission_id: Option<SubmissionId>,
    stdout: Option<String>,
}

impl StdoutResponseBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn stdout(mut self, value: impl Into<String>) -> Self {
        self.stdout = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StdoutResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](StdoutResponseBuilder::submission_id)
    /// - [`stdout`](StdoutResponseBuilder::stdout)
    pub fn build(self) -> Result<StdoutResponse, BuildError> {
        Ok(StdoutResponse {
            submission_id: self
                .submission_id
                .ok_or_else(|| BuildError::missing_field("submission_id"))?,
            stdout: self
                .stdout
                .ok_or_else(|| BuildError::missing_field("stdout"))?,
        })
    }
}
