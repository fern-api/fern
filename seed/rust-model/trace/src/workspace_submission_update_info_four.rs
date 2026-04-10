pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionUpdateInfoFour {
    #[serde(flatten)]
    pub workspace_traced_update_fields: WorkspaceTracedUpdate,
    pub r#type: WorkspaceSubmissionUpdateInfoFourType,
}

impl WorkspaceSubmissionUpdateInfoFour {
    pub fn builder() -> WorkspaceSubmissionUpdateInfoFourBuilder {
        <WorkspaceSubmissionUpdateInfoFourBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionUpdateInfoFourBuilder {
    workspace_traced_update_fields: Option<WorkspaceTracedUpdate>,
    r#type: Option<WorkspaceSubmissionUpdateInfoFourType>,
}

impl WorkspaceSubmissionUpdateInfoFourBuilder {
    pub fn workspace_traced_update_fields(mut self, value: WorkspaceTracedUpdate) -> Self {
        self.workspace_traced_update_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: WorkspaceSubmissionUpdateInfoFourType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionUpdateInfoFour`].
    /// This method will fail if any of the following fields are not set:
    /// - [`workspace_traced_update_fields`](WorkspaceSubmissionUpdateInfoFourBuilder::workspace_traced_update_fields)
    /// - [`r#type`](WorkspaceSubmissionUpdateInfoFourBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionUpdateInfoFour, BuildError> {
        Ok(WorkspaceSubmissionUpdateInfoFour {
            workspace_traced_update_fields: self.workspace_traced_update_fields.ok_or_else(|| BuildError::missing_field("workspace_traced_update_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
