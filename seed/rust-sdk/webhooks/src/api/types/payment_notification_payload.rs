pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaymentNotificationPayload {
    #[serde(rename = "paymentId")]
    pub payment_id: String,
    pub amount: f64,
    pub status: String,
}
