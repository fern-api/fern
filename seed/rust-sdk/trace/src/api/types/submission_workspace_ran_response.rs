pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct WorkspaceRanResponse {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    #[serde(rename = "runDetails")]
    #[serde(default)]
    pub run_details: WorkspaceRunDetails,
}

impl WorkspaceRanResponse {
    pub fn builder() -> WorkspaceRanResponseBuilder {
        WorkspaceRanResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceRanResponseBuilder {
    submission_id: Option<SubmissionId>,
    run_details: Option<WorkspaceRunDetails>,
}

impl WorkspaceRanResponseBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn run_details(mut self, value: WorkspaceRunDetails) -> Self {
        self.run_details = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceRanResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](WorkspaceRanResponseBuilder::submission_id)
    /// - [`run_details`](WorkspaceRanResponseBuilder::run_details)
    pub fn build(self) -> Result<WorkspaceRanResponse, BuildError> {
        Ok(WorkspaceRanResponse {
            submission_id: self
                .submission_id
                .ok_or_else(|| BuildError::missing_field("submission_id"))?,
            run_details: self
                .run_details
                .ok_or_else(|| BuildError::missing_field("run_details"))?,
        })
    }
}
