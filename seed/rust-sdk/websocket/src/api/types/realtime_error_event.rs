pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ErrorEvent {
    #[serde(rename = "errorCode")]
    #[serde(default)]
    pub error_code: i64,
    #[serde(rename = "errorMessage")]
    #[serde(default)]
    pub error_message: String,
}

impl ErrorEvent {
    pub fn builder() -> ErrorEventBuilder {
        ErrorEventBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ErrorEventBuilder {
    error_code: Option<i64>,
    error_message: Option<String>,
}

impl ErrorEventBuilder {
    pub fn error_code(mut self, value: i64) -> Self {
        self.error_code = Some(value);
        self
    }

    pub fn error_message(mut self, value: impl Into<String>) -> Self {
        self.error_message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ErrorEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`error_code`](ErrorEventBuilder::error_code)
    /// - [`error_message`](ErrorEventBuilder::error_message)
    pub fn build(self) -> Result<ErrorEvent, BuildError> {
        Ok(ErrorEvent {
            error_code: self.error_code.ok_or_else(|| BuildError::missing_field("error_code"))?,
            error_message: self.error_message.ok_or_else(|| BuildError::missing_field("error_message"))?,
        })
    }
}
