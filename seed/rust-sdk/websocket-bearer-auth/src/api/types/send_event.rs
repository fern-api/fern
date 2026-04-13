pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendEvent {
    #[serde(rename = "sendText")]
    #[serde(default)]
    pub send_text: String,
    #[serde(rename = "sendParam")]
    #[serde(default)]
    pub send_param: i64,
}

impl SendEvent {
    pub fn builder() -> SendEventBuilder {
        <SendEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendEventBuilder {
    send_text: Option<String>,
    send_param: Option<i64>,
}

impl SendEventBuilder {
    pub fn send_text(mut self, value: impl Into<String>) -> Self {
        self.send_text = Some(value.into());
        self
    }

    pub fn send_param(mut self, value: i64) -> Self {
        self.send_param = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SendEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`send_text`](SendEventBuilder::send_text)
    /// - [`send_param`](SendEventBuilder::send_param)
    pub fn build(self) -> Result<SendEvent, BuildError> {
        Ok(SendEvent {
            send_text: self
                .send_text
                .ok_or_else(|| BuildError::missing_field("send_text"))?,
            send_param: self
                .send_param
                .ok_or_else(|| BuildError::missing_field("send_param"))?,
        })
    }
}
