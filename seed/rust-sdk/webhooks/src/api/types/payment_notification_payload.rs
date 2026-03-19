pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PaymentNotificationPayload {
    #[serde(rename = "paymentId")]
    #[serde(default)]
    pub payment_id: String,
    #[serde(default)]
    pub amount: f64,
    #[serde(default)]
    pub status: String,
}
