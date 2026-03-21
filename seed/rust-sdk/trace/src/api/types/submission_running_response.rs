pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RunningResponse {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    pub state: RunningSubmissionState,
}

impl RunningResponse {
    pub fn builder() -> RunningResponseBuilder {
        RunningResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RunningResponseBuilder {
    submission_id: Option<SubmissionId>,
    state: Option<RunningSubmissionState>,
}

impl RunningResponseBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn state(mut self, value: RunningSubmissionState) -> Self {
        self.state = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RunningResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](RunningResponseBuilder::submission_id)
    /// - [`state`](RunningResponseBuilder::state)
    pub fn build(self) -> Result<RunningResponse, BuildError> {
        Ok(RunningResponse {
            submission_id: self
                .submission_id
                .ok_or_else(|| BuildError::missing_field("submission_id"))?,
            state: self
                .state
                .ok_or_else(|| BuildError::missing_field("state"))?,
        })
    }
}
