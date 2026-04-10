pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionUpdateInfoType {
    pub r#type: WorkspaceSubmissionUpdateInfoTypeType,
}

impl WorkspaceSubmissionUpdateInfoType {
    pub fn builder() -> WorkspaceSubmissionUpdateInfoTypeBuilder {
        <WorkspaceSubmissionUpdateInfoTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionUpdateInfoTypeBuilder {
    r#type: Option<WorkspaceSubmissionUpdateInfoTypeType>,
}

impl WorkspaceSubmissionUpdateInfoTypeBuilder {
    pub fn r#type(mut self, value: WorkspaceSubmissionUpdateInfoTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionUpdateInfoType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](WorkspaceSubmissionUpdateInfoTypeBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionUpdateInfoType, BuildError> {
        Ok(WorkspaceSubmissionUpdateInfoType {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
