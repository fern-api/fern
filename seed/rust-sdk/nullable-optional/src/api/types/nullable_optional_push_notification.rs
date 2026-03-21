pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PushNotification {
    #[serde(rename = "deviceToken")]
    #[serde(default)]
    pub device_token: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub body: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub badge: Option<i64>,
}

impl PushNotification {
    pub fn builder() -> PushNotificationBuilder {
        PushNotificationBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PushNotificationBuilder {
    device_token: Option<String>,
    title: Option<String>,
    body: Option<String>,
    badge: Option<i64>,
}

impl PushNotificationBuilder {
    pub fn device_token(mut self, value: impl Into<String>) -> Self {
        self.device_token = Some(value.into());
        self
    }

    pub fn title(mut self, value: impl Into<String>) -> Self {
        self.title = Some(value.into());
        self
    }

    pub fn body(mut self, value: impl Into<String>) -> Self {
        self.body = Some(value.into());
        self
    }

    pub fn badge(mut self, value: i64) -> Self {
        self.badge = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PushNotification`].
    /// This method will fail if any of the following fields are not set:
    /// - [`device_token`](PushNotificationBuilder::device_token)
    /// - [`title`](PushNotificationBuilder::title)
    /// - [`body`](PushNotificationBuilder::body)
    pub fn build(self) -> Result<PushNotification, BuildError> {
        Ok(PushNotification {
            device_token: self
                .device_token
                .ok_or_else(|| BuildError::missing_field("device_token"))?,
            title: self
                .title
                .ok_or_else(|| BuildError::missing_field("title"))?,
            body: self.body.ok_or_else(|| BuildError::missing_field("body"))?,
            badge: self.badge,
        })
    }
}
