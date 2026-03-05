pub use crate::prelude::*;

/// Base order schema with common order fields.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct OrderBase {
    /// Unique identifier for the order.
    #[serde(rename = "orderId")]
    pub order_id: String,
    /// Total amount for the order.
    pub amount: f64,
    /// Currency code (e.g. USD, EUR).
    pub currency: String,
    /// Timestamp when the order was placed.
    #[serde(rename = "dateTime")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub date_time: Option<DateTime<FixedOffset>>,
}