pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct WorkspaceRunDetails {
    #[serde(rename = "exceptionV2")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception_v_2: Option<ExceptionV2>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception: Option<ExceptionInfo>,
    #[serde(default)]
    pub stdout: String,
}

impl WorkspaceRunDetails {
    pub fn builder() -> WorkspaceRunDetailsBuilder {
        <WorkspaceRunDetailsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceRunDetailsBuilder {
    exception_v_2: Option<ExceptionV2>,
    exception: Option<ExceptionInfo>,
    stdout: Option<String>,
}

impl WorkspaceRunDetailsBuilder {
    pub fn exception_v_2(mut self, value: ExceptionV2) -> Self {
        self.exception_v_2 = Some(value);
        self
    }

    pub fn exception(mut self, value: ExceptionInfo) -> Self {
        self.exception = Some(value);
        self
    }

    pub fn stdout(mut self, value: impl Into<String>) -> Self {
        self.stdout = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceRunDetails`].
    /// This method will fail if any of the following fields are not set:
    /// - [`stdout`](WorkspaceRunDetailsBuilder::stdout)
    pub fn build(self) -> Result<WorkspaceRunDetails, BuildError> {
        Ok(WorkspaceRunDetails {
            exception_v_2: self.exception_v_2,
            exception: self.exception,
            stdout: self
                .stdout
                .ok_or_else(|| BuildError::missing_field("stdout"))?,
        })
    }
}
