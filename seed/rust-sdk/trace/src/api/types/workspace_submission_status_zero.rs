pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionStatusZero {
    pub r#type: WorkspaceSubmissionStatusZeroType,
}

impl WorkspaceSubmissionStatusZero {
    pub fn builder() -> WorkspaceSubmissionStatusZeroBuilder {
        <WorkspaceSubmissionStatusZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionStatusZeroBuilder {
    r#type: Option<WorkspaceSubmissionStatusZeroType>,
}

impl WorkspaceSubmissionStatusZeroBuilder {
    pub fn r#type(mut self, value: WorkspaceSubmissionStatusZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionStatusZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](WorkspaceSubmissionStatusZeroBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionStatusZero, BuildError> {
        Ok(WorkspaceSubmissionStatusZero {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
