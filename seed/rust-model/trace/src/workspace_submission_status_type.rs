pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionStatusType {
    pub r#type: WorkspaceSubmissionStatusTypeType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<RunningSubmissionState>,
}

impl WorkspaceSubmissionStatusType {
    pub fn builder() -> WorkspaceSubmissionStatusTypeBuilder {
        <WorkspaceSubmissionStatusTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionStatusTypeBuilder {
    r#type: Option<WorkspaceSubmissionStatusTypeType>,
    value: Option<RunningSubmissionState>,
}

impl WorkspaceSubmissionStatusTypeBuilder {
    pub fn r#type(mut self, value: WorkspaceSubmissionStatusTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: RunningSubmissionState) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionStatusType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](WorkspaceSubmissionStatusTypeBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionStatusType, BuildError> {
        Ok(WorkspaceSubmissionStatusType {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
