pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionRequestThree {
    #[serde(flatten)]
    pub workspace_submit_request_fields: WorkspaceSubmitRequest,
    pub r#type: SubmissionRequestThreeType,
}

impl SubmissionRequestThree {
    pub fn builder() -> SubmissionRequestThreeBuilder {
        <SubmissionRequestThreeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionRequestThreeBuilder {
    workspace_submit_request_fields: Option<WorkspaceSubmitRequest>,
    r#type: Option<SubmissionRequestThreeType>,
}

impl SubmissionRequestThreeBuilder {
    pub fn workspace_submit_request_fields(mut self, value: WorkspaceSubmitRequest) -> Self {
        self.workspace_submit_request_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SubmissionRequestThreeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionRequestThree`].
    /// This method will fail if any of the following fields are not set:
    /// - [`workspace_submit_request_fields`](SubmissionRequestThreeBuilder::workspace_submit_request_fields)
    /// - [`r#type`](SubmissionRequestThreeBuilder::r#type)
    pub fn build(self) -> Result<SubmissionRequestThree, BuildError> {
        Ok(SubmissionRequestThree {
            workspace_submit_request_fields: self.workspace_submit_request_fields.ok_or_else(|| BuildError::missing_field("workspace_submit_request_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
