pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NoAuthSendEvent {
    #[serde(default)]
    pub text: String,
}

impl NoAuthSendEvent {
    pub fn builder() -> NoAuthSendEventBuilder {
        NoAuthSendEventBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NoAuthSendEventBuilder {
    text: Option<String>,
}

impl NoAuthSendEventBuilder {
    pub fn text(mut self, value: impl Into<String>) -> Self {
        self.text = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NoAuthSendEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`text`](NoAuthSendEventBuilder::text)
    pub fn build(self) -> Result<NoAuthSendEvent, BuildError> {
        Ok(NoAuthSendEvent {
            text: self.text.ok_or_else(|| BuildError::missing_field("text"))?,
        })
    }
}
