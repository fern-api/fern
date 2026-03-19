pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct RefundProcessedPayload {
    #[serde(rename = "refundId")]
    #[serde(default)]
    pub refund_id: String,
    #[serde(default)]
    pub amount: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}
