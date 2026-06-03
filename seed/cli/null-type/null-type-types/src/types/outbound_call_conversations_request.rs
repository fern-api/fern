pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct OutboundCallConversationsRequest {
    /// The phone number to call in E.164 format.
    #[serde(default)]
    pub to_phone_number: String,
    /// If true, validates the outbound call setup without placing a call.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dry_run: Option<bool>,
}

impl OutboundCallConversationsRequest {
    pub fn builder() -> OutboundCallConversationsRequestBuilder {
        <OutboundCallConversationsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct OutboundCallConversationsRequestBuilder {
    to_phone_number: Option<String>,
    dry_run: Option<bool>,
}

impl OutboundCallConversationsRequestBuilder {
    pub fn to_phone_number(mut self, value: impl Into<String>) -> Self {
        self.to_phone_number = Some(value.into());
        self
    }

    pub fn dry_run(mut self, value: bool) -> Self {
        self.dry_run = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`OutboundCallConversationsRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`to_phone_number`](OutboundCallConversationsRequestBuilder::to_phone_number)
    pub fn build(self) -> Result<OutboundCallConversationsRequest, BuildError> {
        Ok(OutboundCallConversationsRequest {
            to_phone_number: self.to_phone_number.ok_or_else(|| BuildError::missing_field("to_phone_number"))?,
            dry_run: self.dry_run,
        })
    }
}

