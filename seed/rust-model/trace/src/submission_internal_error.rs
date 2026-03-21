pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InternalError {
    #[serde(rename = "exceptionInfo")]
    #[serde(default)]
    pub exception_info: ExceptionInfo,
}

impl InternalError {
    pub fn builder() -> InternalErrorBuilder {
        InternalErrorBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InternalErrorBuilder {
    exception_info: Option<ExceptionInfo>,
}

impl InternalErrorBuilder {
    pub fn exception_info(mut self, value: ExceptionInfo) -> Self {
        self.exception_info = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InternalError`].
    /// This method will fail if any of the following fields are not set:
    /// - [`exception_info`](InternalErrorBuilder::exception_info)
    pub fn build(self) -> Result<InternalError, BuildError> {
        Ok(InternalError {
            exception_info: self.exception_info.ok_or_else(|| BuildError::missing_field("exception_info"))?,
        })
    }
}
