pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ErrorEvent {
    #[serde(default)]
    pub error: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<i64>,
}

impl ErrorEvent {
    pub fn builder() -> ErrorEventBuilder {
        <ErrorEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ErrorEventBuilder {
    error: Option<String>,
    code: Option<i64>,
}

impl ErrorEventBuilder {
    pub fn error(mut self, value: impl Into<String>) -> Self {
        self.error = Some(value.into());
        self
    }

    pub fn code(mut self, value: i64) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ErrorEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`error`](ErrorEventBuilder::error)
    pub fn build(self) -> Result<ErrorEvent, BuildError> {
        Ok(ErrorEvent {
            error: self.error.ok_or_else(|| BuildError::missing_field("error"))?,
            code: self.code,
        })
    }
}
