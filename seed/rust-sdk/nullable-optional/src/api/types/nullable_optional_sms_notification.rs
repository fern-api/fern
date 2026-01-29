pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SmsNotification {
    #[serde(rename = "phoneNumber")]
    pub phone_number: String,
    pub message: String,
    #[serde(rename = "shortCode")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub short_code: Option<String>,
}