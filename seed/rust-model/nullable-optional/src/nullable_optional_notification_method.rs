pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum NullableOptionalNotificationMethod {
        Email {
            #[serde(flatten)]
            data: NullableOptionalEmailNotification,
        },

        Sms {
            #[serde(flatten)]
            data: NullableOptionalSmsNotification,
        },

        Push {
            #[serde(flatten)]
            data: NullableOptionalPushNotification,
        },
}
