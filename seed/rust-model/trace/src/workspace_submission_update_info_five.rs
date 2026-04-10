pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceSubmissionUpdateInfoFive {
    pub r#type: WorkspaceSubmissionUpdateInfoFiveType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<ErrorInfo>,
}

impl WorkspaceSubmissionUpdateInfoFive {
    pub fn builder() -> WorkspaceSubmissionUpdateInfoFiveBuilder {
        <WorkspaceSubmissionUpdateInfoFiveBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionUpdateInfoFiveBuilder {
    r#type: Option<WorkspaceSubmissionUpdateInfoFiveType>,
    value: Option<ErrorInfo>,
}

impl WorkspaceSubmissionUpdateInfoFiveBuilder {
    pub fn r#type(mut self, value: WorkspaceSubmissionUpdateInfoFiveType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: ErrorInfo) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionUpdateInfoFive`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](WorkspaceSubmissionUpdateInfoFiveBuilder::r#type)
    pub fn build(self) -> Result<WorkspaceSubmissionUpdateInfoFive, BuildError> {
        Ok(WorkspaceSubmissionUpdateInfoFive {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
