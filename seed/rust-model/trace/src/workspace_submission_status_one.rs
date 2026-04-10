pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionStatusOne {
    pub r#type: WorkspaceSubmissionStatusOneType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<ErrorInfo>,
}

impl WorkspaceSubmissionStatusOne {
    pub fn builder() -> WorkspaceSubmissionStatusOneBuilder {
        <WorkspaceSubmissionStatusOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionStatusOneBuilder {
    r#type: Option<WorkspaceSubmissionStatusOneType>,
    value: Option<ErrorInfo>,
}

impl WorkspaceSubmissionStatusOneBuilder {
    pub fn r#type(mut self, value: WorkspaceSubmissionStatusOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: ErrorInfo) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionStatusOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](WorkspaceSubmissionStatusOneBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionStatusOne, BuildError> {
        Ok(WorkspaceSubmissionStatusOne {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
