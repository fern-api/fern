pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Message {
    #[serde(default)]
    pub sid: String,
    #[serde(default)]
    pub body: String,
}

impl Message {
    pub fn builder() -> MessageBuilder {
        <MessageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MessageBuilder {
    sid: Option<String>,
    body: Option<String>,
}

impl MessageBuilder {
    pub fn sid(mut self, value: impl Into<String>) -> Self {
        self.sid = Some(value.into());
        self
    }

    pub fn body(mut self, value: impl Into<String>) -> Self {
        self.body = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Message`].
    /// This method will fail if any of the following fields are not set:
    /// - [`sid`](MessageBuilder::sid)
    /// - [`body`](MessageBuilder::body)
    pub fn build(self) -> Result<Message, BuildError> {
        Ok(Message {
            sid: self.sid.ok_or_else(|| BuildError::missing_field("sid"))?,
            body: self.body.ok_or_else(|| BuildError::missing_field("body"))?,
        })
    }
}
