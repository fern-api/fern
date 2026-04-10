pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionUpdateInfoThree {
    pub r#type: WorkspaceSubmissionUpdateInfoThreeType,
}

impl WorkspaceSubmissionUpdateInfoThree {
    pub fn builder() -> WorkspaceSubmissionUpdateInfoThreeBuilder {
        <WorkspaceSubmissionUpdateInfoThreeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionUpdateInfoThreeBuilder {
    r#type: Option<WorkspaceSubmissionUpdateInfoThreeType>,
}

impl WorkspaceSubmissionUpdateInfoThreeBuilder {
    pub fn r#type(mut self, value: WorkspaceSubmissionUpdateInfoThreeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionUpdateInfoThree`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](WorkspaceSubmissionUpdateInfoThreeBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionUpdateInfoThree, BuildError> {
        Ok(WorkspaceSubmissionUpdateInfoThree {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
