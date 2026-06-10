pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ForbiddenErrorBody {
    #[serde(default)]
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<ErrorDetails>,
}

impl ForbiddenErrorBody {
    pub fn builder() -> ForbiddenErrorBodyBuilder {
        <ForbiddenErrorBodyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ForbiddenErrorBodyBuilder {
    message: Option<String>,
    error: Option<ErrorDetails>,
}

impl ForbiddenErrorBodyBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    pub fn error(mut self, value: ErrorDetails) -> Self {
        self.error = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ForbiddenErrorBody`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](ForbiddenErrorBodyBuilder::message)
    pub fn build(self) -> Result<ForbiddenErrorBody, BuildError> {
        Ok(ForbiddenErrorBody {
            message: self
                .message
                .ok_or_else(|| BuildError::missing_field("message"))?,
            error: self.error,
        })
    }
}
