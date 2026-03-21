pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CompileError {
    #[serde(default)]
    pub message: String,
}

impl CompileError {
    pub fn builder() -> CompileErrorBuilder {
        CompileErrorBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CompileErrorBuilder {
    message: Option<String>,
}

impl CompileErrorBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CompileError`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](CompileErrorBuilder::message)
    pub fn build(self) -> Result<CompileError, BuildError> {
        Ok(CompileError {
            message: self
                .message
                .ok_or_else(|| BuildError::missing_field("message"))?,
        })
    }
}
