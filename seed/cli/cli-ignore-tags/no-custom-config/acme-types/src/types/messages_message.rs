pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Message {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
}

impl Message {
    pub fn builder() -> MessageBuilder {
        <MessageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MessageBuilder {
    id: Option<String>,
    body: Option<String>,
}

impl MessageBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn body(mut self, value: impl Into<String>) -> Self {
        self.body = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Message`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](MessageBuilder::id)
    pub fn build(self) -> Result<Message, BuildError> {
        Ok(Message {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            body: self.body,
        })
    }
}
