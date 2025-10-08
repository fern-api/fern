pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum NotificationMethod {
    Email {
        #[serde(flatten)]
        data: EmailNotification,
    },

    Sms {
        #[serde(flatten)]
        data: SmsNotification,
    },

    Push {
        #[serde(flatten)]
        data: PushNotification,
    },
}
