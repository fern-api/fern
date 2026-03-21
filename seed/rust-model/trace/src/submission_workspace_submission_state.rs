pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceSubmissionState {
    pub status: WorkspaceSubmissionStatus,
}

impl WorkspaceSubmissionState {
    pub fn builder() -> WorkspaceSubmissionStateBuilder {
        WorkspaceSubmissionStateBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionStateBuilder {
    status: Option<WorkspaceSubmissionStatus>,
}

impl WorkspaceSubmissionStateBuilder {
    pub fn status(mut self, value: WorkspaceSubmissionStatus) -> Self {
        self.status = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionState`].
    /// This method will fail if any of the following fields are not set:
    /// - [`status`](WorkspaceSubmissionStateBuilder::status)
    pub fn build(self) -> Result<WorkspaceSubmissionState, BuildError> {
        Ok(WorkspaceSubmissionState {
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
