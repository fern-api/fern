pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionStatusThree {
    #[serde(flatten)]
    pub workspace_run_details_fields: WorkspaceRunDetails,
    pub r#type: WorkspaceSubmissionStatusThreeType,
}

impl WorkspaceSubmissionStatusThree {
    pub fn builder() -> WorkspaceSubmissionStatusThreeBuilder {
        <WorkspaceSubmissionStatusThreeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionStatusThreeBuilder {
    workspace_run_details_fields: Option<WorkspaceRunDetails>,
    r#type: Option<WorkspaceSubmissionStatusThreeType>,
}

impl WorkspaceSubmissionStatusThreeBuilder {
    pub fn workspace_run_details_fields(mut self, value: WorkspaceRunDetails) -> Self {
        self.workspace_run_details_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: WorkspaceSubmissionStatusThreeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionStatusThree`].
    /// This method will fail if any of the following fields are not set:
    /// - [`workspace_run_details_fields`](WorkspaceSubmissionStatusThreeBuilder::workspace_run_details_fields)
    /// - [`r#type`](WorkspaceSubmissionStatusThreeBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionStatusThree, BuildError> {
        Ok(WorkspaceSubmissionStatusThree {
            workspace_run_details_fields: self
                .workspace_run_details_fields
                .ok_or_else(|| BuildError::missing_field("workspace_run_details_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
