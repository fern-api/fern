pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionUpdateInfoOne {
    #[serde(flatten)]
    pub workspace_run_details_fields: WorkspaceRunDetails,
    pub r#type: WorkspaceSubmissionUpdateInfoOneType,
}

impl WorkspaceSubmissionUpdateInfoOne {
    pub fn builder() -> WorkspaceSubmissionUpdateInfoOneBuilder {
        <WorkspaceSubmissionUpdateInfoOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionUpdateInfoOneBuilder {
    workspace_run_details_fields: Option<WorkspaceRunDetails>,
    r#type: Option<WorkspaceSubmissionUpdateInfoOneType>,
}

impl WorkspaceSubmissionUpdateInfoOneBuilder {
    pub fn workspace_run_details_fields(mut self, value: WorkspaceRunDetails) -> Self {
        self.workspace_run_details_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: WorkspaceSubmissionUpdateInfoOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionUpdateInfoOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`workspace_run_details_fields`](WorkspaceSubmissionUpdateInfoOneBuilder::workspace_run_details_fields)
    /// - [`r#type`](WorkspaceSubmissionUpdateInfoOneBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionUpdateInfoOne, BuildError> {
        Ok(WorkspaceSubmissionUpdateInfoOne {
            workspace_run_details_fields: self.workspace_run_details_fields.ok_or_else(|| BuildError::missing_field("workspace_run_details_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
