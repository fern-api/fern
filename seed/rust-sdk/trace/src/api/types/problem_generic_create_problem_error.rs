pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GenericCreateProblemError {
    #[serde(default)]
    pub message: String,
    #[serde(default)]
    pub r#type: String,
    #[serde(default)]
    pub stacktrace: String,
}

impl GenericCreateProblemError {
    pub fn builder() -> GenericCreateProblemErrorBuilder {
        GenericCreateProblemErrorBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GenericCreateProblemErrorBuilder {
    message: Option<String>,
    r#type: Option<String>,
    stacktrace: Option<String>,
}

impl GenericCreateProblemErrorBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    pub fn stacktrace(mut self, value: impl Into<String>) -> Self {
        self.stacktrace = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GenericCreateProblemError`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](GenericCreateProblemErrorBuilder::message)
    /// - [`r#type`](GenericCreateProblemErrorBuilder::r#type)
    /// - [`stacktrace`](GenericCreateProblemErrorBuilder::stacktrace)
    pub fn build(self) -> Result<GenericCreateProblemError, BuildError> {
        Ok(GenericCreateProblemError {
            message: self
                .message
                .ok_or_else(|| BuildError::missing_field("message"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            stacktrace: self
                .stacktrace
                .ok_or_else(|| BuildError::missing_field("stacktrace"))?,
        })
    }
}
