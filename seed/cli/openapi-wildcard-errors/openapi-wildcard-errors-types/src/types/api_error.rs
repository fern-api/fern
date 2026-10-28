pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

/// The shared error body returned for every 4XX and 5XX status.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ApiError {
    #[serde(default)]
    pub error_type: String,
    #[serde(default)]
    pub error_code: String,
    #[serde(default)]
    pub error_message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_id: Option<String>,
}

impl ApiError {
    pub fn builder() -> ApiErrorBuilder {
        <ApiErrorBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ApiErrorBuilder {
    error_type: Option<String>,
    error_code: Option<String>,
    error_message: Option<String>,
    request_id: Option<String>,
}

impl ApiErrorBuilder {
    pub fn error_type(mut self, value: impl Into<String>) -> Self {
        self.error_type = Some(value.into());
        self
    }

    pub fn error_code(mut self, value: impl Into<String>) -> Self {
        self.error_code = Some(value.into());
        self
    }

    pub fn error_message(mut self, value: impl Into<String>) -> Self {
        self.error_message = Some(value.into());
        self
    }

    pub fn request_id(mut self, value: impl Into<String>) -> Self {
        self.request_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ApiError`].
    /// This method will fail if any of the following fields are not set:
    /// - [`error_type`](ApiErrorBuilder::error_type)
    /// - [`error_code`](ApiErrorBuilder::error_code)
    /// - [`error_message`](ApiErrorBuilder::error_message)
    pub fn build(self) -> Result<ApiError, BuildError> {
        Ok(ApiError {
            error_type: self.error_type.ok_or_else(|| BuildError::missing_field("error_type"))?,
            error_code: self.error_code.ok_or_else(|| BuildError::missing_field("error_code"))?,
            error_message: self.error_message.ok_or_else(|| BuildError::missing_field("error_message"))?,
            request_id: self.request_id,
        })
    }
}
