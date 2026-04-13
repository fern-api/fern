pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct NotificationMethodTwo {
    #[serde(flatten)]
    pub push_notification_fields: PushNotification,
    pub r#type: NotificationMethodTwoType,
}

impl NotificationMethodTwo {
    pub fn builder() -> NotificationMethodTwoBuilder {
        <NotificationMethodTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NotificationMethodTwoBuilder {
    push_notification_fields: Option<PushNotification>,
    r#type: Option<NotificationMethodTwoType>,
}

impl NotificationMethodTwoBuilder {
    pub fn push_notification_fields(mut self, value: PushNotification) -> Self {
        self.push_notification_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: NotificationMethodTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NotificationMethodTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`push_notification_fields`](NotificationMethodTwoBuilder::push_notification_fields)
    /// - [`r#type`](NotificationMethodTwoBuilder::r#type)
    pub fn build(self) -> Result<NotificationMethodTwo, BuildError> {
        Ok(NotificationMethodTwo {
            push_notification_fields: self.push_notification_fields.ok_or_else(|| BuildError::missing_field("push_notification_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
