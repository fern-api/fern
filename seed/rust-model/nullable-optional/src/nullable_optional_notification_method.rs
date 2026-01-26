pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum NotificationMethod {
        #[serde(rename = "email")]
        Email {
            #[serde(flatten)]
            data: EmailNotification,
        },

        #[serde(rename = "sms")]
        Sms {
            #[serde(flatten)]
            data: SmsNotification,
        },

        #[serde(rename = "push")]
        Push {
            #[serde(flatten)]
            data: PushNotification,
        },
}
