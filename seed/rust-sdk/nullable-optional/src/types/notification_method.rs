use crate::email_notification::EmailNotification;
use crate::sms_notification::SmsNotification;
use crate::push_notification::PushNotification;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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
