use crate::nullable_optional_email_notification::EmailNotification;
use crate::nullable_optional_sms_notification::SmsNotification;
use crate::nullable_optional_push_notification::PushNotification;
use serde::{Deserialize, Serialize};

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
