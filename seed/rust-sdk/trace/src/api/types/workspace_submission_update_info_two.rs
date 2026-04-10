pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionUpdateInfoTwo {
    pub r#type: WorkspaceSubmissionUpdateInfoTwoType,
}

impl WorkspaceSubmissionUpdateInfoTwo {
    pub fn builder() -> WorkspaceSubmissionUpdateInfoTwoBuilder {
        <WorkspaceSubmissionUpdateInfoTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionUpdateInfoTwoBuilder {
    r#type: Option<WorkspaceSubmissionUpdateInfoTwoType>,
}

impl WorkspaceSubmissionUpdateInfoTwoBuilder {
    pub fn r#type(mut self, value: WorkspaceSubmissionUpdateInfoTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionUpdateInfoTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](WorkspaceSubmissionUpdateInfoTwoBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionUpdateInfoTwo, BuildError> {
        Ok(WorkspaceSubmissionUpdateInfoTwo {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
