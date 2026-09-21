pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct MessageReceived {
    #[serde(rename = "MessageSid")]
    #[serde(default)]
    pub message_sid: String,
    #[serde(rename = "From")]
    #[serde(default)]
    pub from: String,
    #[serde(rename = "To")]
    #[serde(default)]
    pub to: String,
    #[serde(rename = "Body")]
    #[serde(default)]
    pub body: String,
    #[serde(rename = "NumMedia")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_media: Option<i64>,
}

impl MessageReceived {
    pub fn builder() -> MessageReceivedBuilder {
        <MessageReceivedBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MessageReceivedBuilder {
    message_sid: Option<String>,
    from: Option<String>,
    to: Option<String>,
    body: Option<String>,
    num_media: Option<i64>,
}

impl MessageReceivedBuilder {
    pub fn message_sid(mut self, value: impl Into<String>) -> Self {
        self.message_sid = Some(value.into());
        self
    }

    pub fn from(mut self, value: impl Into<String>) -> Self {
        self.from = Some(value.into());
        self
    }

    pub fn to(mut self, value: impl Into<String>) -> Self {
        self.to = Some(value.into());
        self
    }

    pub fn body(mut self, value: impl Into<String>) -> Self {
        self.body = Some(value.into());
        self
    }

    pub fn num_media(mut self, value: i64) -> Self {
        self.num_media = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`MessageReceived`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message_sid`](MessageReceivedBuilder::message_sid)
    /// - [`from`](MessageReceivedBuilder::from)
    /// - [`to`](MessageReceivedBuilder::to)
    /// - [`body`](MessageReceivedBuilder::body)
    pub fn build(self) -> Result<MessageReceived, BuildError> {
        Ok(MessageReceived {
            message_sid: self.message_sid.ok_or_else(|| BuildError::missing_field("message_sid"))?,
            from: self.from.ok_or_else(|| BuildError::missing_field("from"))?,
            to: self.to.ok_or_else(|| BuildError::missing_field("to"))?,
            body: self.body.ok_or_else(|| BuildError::missing_field("body"))?,
            num_media: self.num_media,
        })
    }
}
