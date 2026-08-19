pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ErrorBody {
    #[serde(default)]
    pub message: String,
    #[serde(default)]
    pub code: i64,
}

impl ErrorBody {
    pub fn builder() -> ErrorBodyBuilder {
        <ErrorBodyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ErrorBodyBuilder {
    message: Option<String>,
    code: Option<i64>,
}

impl ErrorBodyBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    pub fn code(mut self, value: i64) -> Self {
        self.code = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ErrorBody`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](ErrorBodyBuilder::message)
    /// - [`code`](ErrorBodyBuilder::code)
    pub fn build(self) -> Result<ErrorBody, BuildError> {
        Ok(ErrorBody {
            message: self
                .message
                .ok_or_else(|| BuildError::missing_field("message"))?,
            code: self.code.ok_or_else(|| BuildError::missing_field("code"))?,
        })
    }
}
