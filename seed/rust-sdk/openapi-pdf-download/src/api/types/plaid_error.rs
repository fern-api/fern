pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PlaidError {
    #[serde(default)]
    pub error_type: String,
    #[serde(default)]
    pub error_code: String,
    #[serde(default)]
    pub error_message: String,
}

impl PlaidError {
    pub fn builder() -> PlaidErrorBuilder {
        <PlaidErrorBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PlaidErrorBuilder {
    error_type: Option<String>,
    error_code: Option<String>,
    error_message: Option<String>,
}

impl PlaidErrorBuilder {
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

    /// Consumes the builder and constructs a [`PlaidError`].
    /// This method will fail if any of the following fields are not set:
    /// - [`error_type`](PlaidErrorBuilder::error_type)
    /// - [`error_code`](PlaidErrorBuilder::error_code)
    /// - [`error_message`](PlaidErrorBuilder::error_message)
    pub fn build(self) -> Result<PlaidError, BuildError> {
        Ok(PlaidError {
            error_type: self
                .error_type
                .ok_or_else(|| BuildError::missing_field("error_type"))?,
            error_code: self
                .error_code
                .ok_or_else(|| BuildError::missing_field("error_code"))?,
            error_message: self
                .error_message
                .ok_or_else(|| BuildError::missing_field("error_message"))?,
        })
    }
}
