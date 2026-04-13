pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct NotificationMethodZero {
    #[serde(flatten)]
    pub email_notification_fields: EmailNotification,
    pub r#type: NotificationMethodZeroType,
}

impl NotificationMethodZero {
    pub fn builder() -> NotificationMethodZeroBuilder {
        <NotificationMethodZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NotificationMethodZeroBuilder {
    email_notification_fields: Option<EmailNotification>,
    r#type: Option<NotificationMethodZeroType>,
}

impl NotificationMethodZeroBuilder {
    pub fn email_notification_fields(mut self, value: EmailNotification) -> Self {
        self.email_notification_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: NotificationMethodZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NotificationMethodZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`email_notification_fields`](NotificationMethodZeroBuilder::email_notification_fields)
    /// - [`r#type`](NotificationMethodZeroBuilder::r#type)
    pub fn build(self) -> Result<NotificationMethodZero, BuildError> {
        Ok(NotificationMethodZero {
            email_notification_fields: self
                .email_notification_fields
                .ok_or_else(|| BuildError::missing_field("email_notification_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
