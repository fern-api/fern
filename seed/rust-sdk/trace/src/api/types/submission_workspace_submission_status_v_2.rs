pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct WorkspaceSubmissionStatusV2 {
    #[serde(default)]
    pub updates: Vec<WorkspaceSubmissionUpdate>,
}

impl WorkspaceSubmissionStatusV2 {
    pub fn builder() -> WorkspaceSubmissionStatusV2Builder {
        WorkspaceSubmissionStatusV2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionStatusV2Builder {
    updates: Option<Vec<WorkspaceSubmissionUpdate>>,
}

impl WorkspaceSubmissionStatusV2Builder {
    pub fn updates(mut self, value: Vec<WorkspaceSubmissionUpdate>) -> Self {
        self.updates = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionStatusV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`updates`](WorkspaceSubmissionStatusV2Builder::updates)
    pub fn build(self) -> Result<WorkspaceSubmissionStatusV2, BuildError> {
        Ok(WorkspaceSubmissionStatusV2 {
            updates: self
                .updates
                .ok_or_else(|| BuildError::missing_field("updates"))?,
        })
    }
}
