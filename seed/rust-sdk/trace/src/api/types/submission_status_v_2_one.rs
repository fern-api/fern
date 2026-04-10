pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionStatusV2One {
    #[serde(flatten)]
    pub workspace_submission_status_v2_fields: WorkspaceSubmissionStatusV2,
    pub r#type: SubmissionStatusV2OneType,
}

impl SubmissionStatusV2One {
    pub fn builder() -> SubmissionStatusV2OneBuilder {
        <SubmissionStatusV2OneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionStatusV2OneBuilder {
    workspace_submission_status_v2_fields: Option<WorkspaceSubmissionStatusV2>,
    r#type: Option<SubmissionStatusV2OneType>,
}

impl SubmissionStatusV2OneBuilder {
    pub fn workspace_submission_status_v2_fields(
        mut self,
        value: WorkspaceSubmissionStatusV2,
    ) -> Self {
        self.workspace_submission_status_v2_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SubmissionStatusV2OneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionStatusV2One`].
    /// This method will fail if any of the following fields are not set:
    /// - [`workspace_submission_status_v2_fields`](SubmissionStatusV2OneBuilder::workspace_submission_status_v2_fields)
    /// - [`r#type`](SubmissionStatusV2OneBuilder::r#type)
    pub fn build(self) -> Result<SubmissionStatusV2One, BuildError> {
        Ok(SubmissionStatusV2One {
            workspace_submission_status_v2_fields: self
                .workspace_submission_status_v2_fields
                .ok_or_else(|| {
                    BuildError::missing_field("workspace_submission_status_v2_fields")
                })?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
