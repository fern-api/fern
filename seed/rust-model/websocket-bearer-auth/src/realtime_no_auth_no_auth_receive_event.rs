pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NoAuthReceiveEvent {
    #[serde(default)]
    pub response: String,
}

impl NoAuthReceiveEvent {
    pub fn builder() -> NoAuthReceiveEventBuilder {
        NoAuthReceiveEventBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NoAuthReceiveEventBuilder {
    response: Option<String>,
}

impl NoAuthReceiveEventBuilder {
    pub fn response(mut self, value: impl Into<String>) -> Self {
        self.response = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NoAuthReceiveEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`response`](NoAuthReceiveEventBuilder::response)
    pub fn build(self) -> Result<NoAuthReceiveEvent, BuildError> {
        Ok(NoAuthReceiveEvent {
            response: self.response.ok_or_else(|| BuildError::missing_field("response"))?,
        })
    }
}
