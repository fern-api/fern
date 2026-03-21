pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SmsNotification {
    #[serde(rename = "phoneNumber")]
    #[serde(default)]
    pub phone_number: String,
    #[serde(default)]
    pub message: String,
    #[serde(rename = "shortCode")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub short_code: Option<String>,
}

impl SmsNotification {
    pub fn builder() -> SmsNotificationBuilder {
        SmsNotificationBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SmsNotificationBuilder {
    phone_number: Option<String>,
    message: Option<String>,
    short_code: Option<String>,
}

impl SmsNotificationBuilder {
    pub fn phone_number(mut self, value: impl Into<String>) -> Self {
        self.phone_number = Some(value.into());
        self
    }

    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    pub fn short_code(mut self, value: impl Into<String>) -> Self {
        self.short_code = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SmsNotification`].
    /// This method will fail if any of the following fields are not set:
    /// - [`phone_number`](SmsNotificationBuilder::phone_number)
    /// - [`message`](SmsNotificationBuilder::message)
    pub fn build(self) -> Result<SmsNotification, BuildError> {
        Ok(SmsNotification {
            phone_number: self.phone_number.ok_or_else(|| BuildError::missing_field("phone_number"))?,
            message: self.message.ok_or_else(|| BuildError::missing_field("message"))?,
            short_code: self.short_code,
        })
    }
}
