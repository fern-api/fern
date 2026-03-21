pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RuntimeError {
    #[serde(default)]
    pub message: String,
}

impl RuntimeError {
    pub fn builder() -> RuntimeErrorBuilder {
        RuntimeErrorBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RuntimeErrorBuilder {
    message: Option<String>,
}

impl RuntimeErrorBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`RuntimeError`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](RuntimeErrorBuilder::message)
    pub fn build(self) -> Result<RuntimeError, BuildError> {
        Ok(RuntimeError {
            message: self
                .message
                .ok_or_else(|| BuildError::missing_field("message"))?,
        })
    }
}
