pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ExceptionInfo {
    #[serde(rename = "exceptionType")]
    #[serde(default)]
    pub exception_type: String,
    #[serde(rename = "exceptionMessage")]
    #[serde(default)]
    pub exception_message: String,
    #[serde(rename = "exceptionStacktrace")]
    #[serde(default)]
    pub exception_stacktrace: String,
}

impl ExceptionInfo {
    pub fn builder() -> ExceptionInfoBuilder {
        ExceptionInfoBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExceptionInfoBuilder {
    exception_type: Option<String>,
    exception_message: Option<String>,
    exception_stacktrace: Option<String>,
}

impl ExceptionInfoBuilder {
    pub fn exception_type(mut self, value: impl Into<String>) -> Self {
        self.exception_type = Some(value.into());
        self
    }

    pub fn exception_message(mut self, value: impl Into<String>) -> Self {
        self.exception_message = Some(value.into());
        self
    }

    pub fn exception_stacktrace(mut self, value: impl Into<String>) -> Self {
        self.exception_stacktrace = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ExceptionInfo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`exception_type`](ExceptionInfoBuilder::exception_type)
    /// - [`exception_message`](ExceptionInfoBuilder::exception_message)
    /// - [`exception_stacktrace`](ExceptionInfoBuilder::exception_stacktrace)
    pub fn build(self) -> Result<ExceptionInfo, BuildError> {
        Ok(ExceptionInfo {
            exception_type: self
                .exception_type
                .ok_or_else(|| BuildError::missing_field("exception_type"))?,
            exception_message: self
                .exception_message
                .ok_or_else(|| BuildError::missing_field("exception_message"))?,
            exception_stacktrace: self
                .exception_stacktrace
                .ok_or_else(|| BuildError::missing_field("exception_stacktrace"))?,
        })
    }
}
