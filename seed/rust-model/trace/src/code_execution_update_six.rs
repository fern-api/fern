pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CodeExecutionUpdateSix {
    #[serde(flatten)]
    pub workspace_ran_response_fields: WorkspaceRanResponse,
    pub r#type: CodeExecutionUpdateSixType,
}

impl CodeExecutionUpdateSix {
    pub fn builder() -> CodeExecutionUpdateSixBuilder {
        <CodeExecutionUpdateSixBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CodeExecutionUpdateSixBuilder {
    workspace_ran_response_fields: Option<WorkspaceRanResponse>,
    r#type: Option<CodeExecutionUpdateSixType>,
}

impl CodeExecutionUpdateSixBuilder {
    pub fn workspace_ran_response_fields(mut self, value: WorkspaceRanResponse) -> Self {
        self.workspace_ran_response_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CodeExecutionUpdateSixType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CodeExecutionUpdateSix`].
    /// This method will fail if any of the following fields are not set:
    /// - [`workspace_ran_response_fields`](CodeExecutionUpdateSixBuilder::workspace_ran_response_fields)
    /// - [`r#type`](CodeExecutionUpdateSixBuilder::r#type)
    pub fn build(self) -> Result<CodeExecutionUpdateSix, BuildError> {
        Ok(CodeExecutionUpdateSix {
            workspace_ran_response_fields: self.workspace_ran_response_fields.ok_or_else(|| BuildError::missing_field("workspace_ran_response_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
