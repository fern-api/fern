pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CallStatusWebhooksPayload {
    #[serde(rename = "CallSid")]
    #[serde(default)]
    pub call_sid: String,
    #[serde(rename = "CallStatus")]
    pub call_status: CallStatusWebhooksPayloadCallStatus,
}

impl CallStatusWebhooksPayload {
    pub fn builder() -> CallStatusWebhooksPayloadBuilder {
        <CallStatusWebhooksPayloadBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CallStatusWebhooksPayloadBuilder {
    call_sid: Option<String>,
    call_status: Option<CallStatusWebhooksPayloadCallStatus>,
}

impl CallStatusWebhooksPayloadBuilder {
    pub fn call_sid(mut self, value: impl Into<String>) -> Self {
        self.call_sid = Some(value.into());
        self
    }

    pub fn call_status(mut self, value: CallStatusWebhooksPayloadCallStatus) -> Self {
        self.call_status = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CallStatusWebhooksPayload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`call_sid`](CallStatusWebhooksPayloadBuilder::call_sid)
    /// - [`call_status`](CallStatusWebhooksPayloadBuilder::call_status)
    pub fn build(self) -> Result<CallStatusWebhooksPayload, BuildError> {
        Ok(CallStatusWebhooksPayload {
            call_sid: self.call_sid.ok_or_else(|| BuildError::missing_field("call_sid"))?,
            call_status: self.call_status.ok_or_else(|| BuildError::missing_field("call_status"))?,
        })
    }
}
