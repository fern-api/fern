pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct OrderCompletedPayload {
    #[serde(rename = "orderId")]
    pub order_id: String,
    pub total: f64,
    pub currency: String,
}
