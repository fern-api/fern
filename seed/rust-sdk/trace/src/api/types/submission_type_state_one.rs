pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionTypeStateOne {
    #[serde(flatten)]
    pub workspace_submission_state_fields: WorkspaceSubmissionState,
    pub r#type: SubmissionTypeStateOneType,
}

impl SubmissionTypeStateOne {
    pub fn builder() -> SubmissionTypeStateOneBuilder {
        <SubmissionTypeStateOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionTypeStateOneBuilder {
    workspace_submission_state_fields: Option<WorkspaceSubmissionState>,
    r#type: Option<SubmissionTypeStateOneType>,
}

impl SubmissionTypeStateOneBuilder {
    pub fn workspace_submission_state_fields(mut self, value: WorkspaceSubmissionState) -> Self {
        self.workspace_submission_state_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SubmissionTypeStateOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionTypeStateOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`workspace_submission_state_fields`](SubmissionTypeStateOneBuilder::workspace_submission_state_fields)
    /// - [`r#type`](SubmissionTypeStateOneBuilder::r#type)
    pub fn build(self) -> Result<SubmissionTypeStateOne, BuildError> {
        Ok(SubmissionTypeStateOne {
            workspace_submission_state_fields: self
                .workspace_submission_state_fields
                .ok_or_else(|| BuildError::missing_field("workspace_submission_state_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
