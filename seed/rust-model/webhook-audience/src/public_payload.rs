pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PublicPayload {
    #[serde(default)]
    pub message: String,
}

impl PublicPayload {
    pub fn builder() -> PublicPayloadBuilder {
        PublicPayloadBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PublicPayloadBuilder {
    message: Option<String>,
}

impl PublicPayloadBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PublicPayload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](PublicPayloadBuilder::message)
    pub fn build(self) -> Result<PublicPayload, BuildError> {
        Ok(PublicPayload {
            message: self.message.ok_or_else(|| BuildError::missing_field("message"))?,
        })
    }
}
