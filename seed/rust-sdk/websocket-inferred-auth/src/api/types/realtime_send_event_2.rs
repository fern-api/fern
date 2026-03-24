pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendEvent2 {
    #[serde(rename = "sendText2")]
    #[serde(default)]
    pub send_text_2: String,
    #[serde(rename = "sendParam2")]
    #[serde(default)]
    pub send_param_2: bool,
}

impl SendEvent2 {
    pub fn builder() -> SendEvent2Builder {
        SendEvent2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendEvent2Builder {
    send_text_2: Option<String>,
    send_param_2: Option<bool>,
}

impl SendEvent2Builder {
    pub fn send_text_2(mut self, value: impl Into<String>) -> Self {
        self.send_text_2 = Some(value.into());
        self
    }

    pub fn send_param_2(mut self, value: bool) -> Self {
        self.send_param_2 = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SendEvent2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`send_text_2`](SendEvent2Builder::send_text_2)
    /// - [`send_param_2`](SendEvent2Builder::send_param_2)
    pub fn build(self) -> Result<SendEvent2, BuildError> {
        Ok(SendEvent2 {
            send_text_2: self
                .send_text_2
                .ok_or_else(|| BuildError::missing_field("send_text_2"))?,
            send_param_2: self
                .send_param_2
                .ok_or_else(|| BuildError::missing_field("send_param_2"))?,
        })
    }
}
