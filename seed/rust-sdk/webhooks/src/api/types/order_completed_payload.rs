pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct OrderCompletedPayload {
    #[serde(rename = "orderId")]
    #[serde(default)]
    pub order_id: String,
    #[serde(default)]
    pub total: f64,
    #[serde(default)]
    pub currency: String,
}
