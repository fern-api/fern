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