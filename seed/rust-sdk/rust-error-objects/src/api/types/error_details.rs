pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ErrorDetails {
    #[serde(default)]
    pub request_id: String,
    #[serde(default)]
    pub code: String,
}

impl ErrorDetails {
    pub fn builder() -> ErrorDetailsBuilder {
        <ErrorDetailsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ErrorDetailsBuilder {
    request_id: Option<String>,
    code: Option<String>,
}

impl ErrorDetailsBuilder {
    pub fn request_id(mut self, value: impl Into<String>) -> Self {
        self.request_id = Some(value.into());
        self
    }

    pub fn code(mut self, value: impl Into<String>) -> Self {
        self.code = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ErrorDetails`].
    /// This method will fail if any of the following fields are not set:
    /// - [`request_id`](ErrorDetailsBuilder::request_id)
    /// - [`code`](ErrorDetailsBuilder::code)
    pub fn build(self) -> Result<ErrorDetails, BuildError> {
        Ok(ErrorDetails {
            request_id: self
                .request_id
                .ok_or_else(|| BuildError::missing_field("request_id"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
