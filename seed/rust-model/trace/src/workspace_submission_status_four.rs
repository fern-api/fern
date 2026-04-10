pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionStatusFour {
    #[serde(flatten)]
    pub workspace_run_details_fields: WorkspaceRunDetails,
    pub r#type: WorkspaceSubmissionStatusFourType,
}

impl WorkspaceSubmissionStatusFour {
    pub fn builder() -> WorkspaceSubmissionStatusFourBuilder {
        <WorkspaceSubmissionStatusFourBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionStatusFourBuilder {
    workspace_run_details_fields: Option<WorkspaceRunDetails>,
    r#type: Option<WorkspaceSubmissionStatusFourType>,
}

impl WorkspaceSubmissionStatusFourBuilder {
    pub fn workspace_run_details_fields(mut self, value: WorkspaceRunDetails) -> Self {
        self.workspace_run_details_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: WorkspaceSubmissionStatusFourType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionStatusFour`].
    /// This method will fail if any of the following fields are not set:
    /// - [`workspace_run_details_fields`](WorkspaceSubmissionStatusFourBuilder::workspace_run_details_fields)
    /// - [`r#type`](WorkspaceSubmissionStatusFourBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionStatusFour, BuildError> {
        Ok(WorkspaceSubmissionStatusFour {
            workspace_run_details_fields: self.workspace_run_details_fields.ok_or_else(|| BuildError::missing_field("workspace_run_details_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
