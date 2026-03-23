pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ErrorResponse {
    #[serde(default)]
    pub error: String,
    #[serde(default)]
    pub code: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<Vec<String>>,
}

impl ErrorResponse {
    pub fn builder() -> ErrorResponseBuilder {
        ErrorResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ErrorResponseBuilder {
    error: Option<String>,
    code: Option<i64>,
    details: Option<Vec<String>>,
}

impl ErrorResponseBuilder {
    pub fn error(mut self, value: impl Into<String>) -> Self {
        self.error = Some(value.into());
        self
    }

    pub fn code(mut self, value: i64) -> Self {
        self.code = Some(value);
        self
    }

    pub fn details(mut self, value: Vec<String>) -> Self {
        self.details = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ErrorResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`error`](ErrorResponseBuilder::error)
    /// - [`code`](ErrorResponseBuilder::code)
    pub fn build(self) -> Result<ErrorResponse, BuildError> {
        Ok(ErrorResponse {
            error: self.error.ok_or_else(|| BuildError::missing_field("error"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
            details: self.details,
        })
    }
}
