pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SmsStatusPayload {
    #[serde(rename = "messageSid")]
    #[serde(default)]
    pub message_sid: String,
    #[serde(default)]
    pub status: String,
}

impl SmsStatusPayload {
    pub fn builder() -> SmsStatusPayloadBuilder {
        <SmsStatusPayloadBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SmsStatusPayloadBuilder {
    message_sid: Option<String>,
    status: Option<String>,
}

impl SmsStatusPayloadBuilder {
    pub fn message_sid(mut self, value: impl Into<String>) -> Self {
        self.message_sid = Some(value.into());
        self
    }

    pub fn status(mut self, value: impl Into<String>) -> Self {
        self.status = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SmsStatusPayload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message_sid`](SmsStatusPayloadBuilder::message_sid)
    /// - [`status`](SmsStatusPayloadBuilder::status)
    pub fn build(self) -> Result<SmsStatusPayload, BuildError> {
        Ok(SmsStatusPayload {
            message_sid: self
                .message_sid
                .ok_or_else(|| BuildError::missing_field("message_sid"))?,
            status: self
                .status
                .ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
