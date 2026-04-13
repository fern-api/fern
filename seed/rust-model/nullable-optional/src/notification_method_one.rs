pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct NotificationMethodOne {
    #[serde(flatten)]
    pub sms_notification_fields: SmsNotification,
    pub r#type: NotificationMethodOneType,
}

impl NotificationMethodOne {
    pub fn builder() -> NotificationMethodOneBuilder {
        <NotificationMethodOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NotificationMethodOneBuilder {
    sms_notification_fields: Option<SmsNotification>,
    r#type: Option<NotificationMethodOneType>,
}

impl NotificationMethodOneBuilder {
    pub fn sms_notification_fields(mut self, value: SmsNotification) -> Self {
        self.sms_notification_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: NotificationMethodOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NotificationMethodOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`sms_notification_fields`](NotificationMethodOneBuilder::sms_notification_fields)
    /// - [`r#type`](NotificationMethodOneBuilder::r#type)
    pub fn build(self) -> Result<NotificationMethodOne, BuildError> {
        Ok(NotificationMethodOne {
            sms_notification_fields: self.sms_notification_fields.ok_or_else(|| BuildError::missing_field("sms_notification_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
