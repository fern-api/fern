pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionUpdateInfoZero {
    pub r#type: WorkspaceSubmissionUpdateInfoZeroType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<RunningSubmissionState>,
}

impl WorkspaceSubmissionUpdateInfoZero {
    pub fn builder() -> WorkspaceSubmissionUpdateInfoZeroBuilder {
        <WorkspaceSubmissionUpdateInfoZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionUpdateInfoZeroBuilder {
    r#type: Option<WorkspaceSubmissionUpdateInfoZeroType>,
    value: Option<RunningSubmissionState>,
}

impl WorkspaceSubmissionUpdateInfoZeroBuilder {
    pub fn r#type(mut self, value: WorkspaceSubmissionUpdateInfoZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: RunningSubmissionState) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionUpdateInfoZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](WorkspaceSubmissionUpdateInfoZeroBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionUpdateInfoZero, BuildError> {
        Ok(WorkspaceSubmissionUpdateInfoZero {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
