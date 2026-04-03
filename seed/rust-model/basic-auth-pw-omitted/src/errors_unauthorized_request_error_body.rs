pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UnauthorizedRequestErrorBody {
    #[serde(default)]
    pub message: String,
}

impl UnauthorizedRequestErrorBody {
    pub fn builder() -> UnauthorizedRequestErrorBodyBuilder {
        <UnauthorizedRequestErrorBodyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnauthorizedRequestErrorBodyBuilder {
    message: Option<String>,
}

impl UnauthorizedRequestErrorBodyBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UnauthorizedRequestErrorBody`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](UnauthorizedRequestErrorBodyBuilder::message)
    pub fn build(self) -> Result<UnauthorizedRequestErrorBody, BuildError> {
        Ok(UnauthorizedRequestErrorBody {
            message: self.message.ok_or_else(|| BuildError::missing_field("message"))?,
        })
    }
}
