pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BuildingExecutorResponse {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    pub status: ExecutionSessionStatus,
}

impl BuildingExecutorResponse {
    pub fn builder() -> BuildingExecutorResponseBuilder {
        BuildingExecutorResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BuildingExecutorResponseBuilder {
    submission_id: Option<SubmissionId>,
    status: Option<ExecutionSessionStatus>,
}

impl BuildingExecutorResponseBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn status(mut self, value: ExecutionSessionStatus) -> Self {
        self.status = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BuildingExecutorResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](BuildingExecutorResponseBuilder::submission_id)
    /// - [`status`](BuildingExecutorResponseBuilder::status)
    pub fn build(self) -> Result<BuildingExecutorResponse, BuildError> {
        Ok(BuildingExecutorResponse {
            submission_id: self
                .submission_id
                .ok_or_else(|| BuildError::missing_field("submission_id"))?,
            status: self
                .status
                .ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
