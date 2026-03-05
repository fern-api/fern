pub use crate::prelude::*;

/// A plant order that extends OrderBase via allOf but also redefines amount, currency, and orderId inline. Each property should appear only once in the generated type.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PlantOrder {
    #[serde(flatten)]
    pub order_base_fields: OrderBase,
    /// Name of the plant being ordered.
    #[serde(rename = "plantName")]
    pub plant_name: String,
    /// Number of plants ordered.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub quantity: Option<i64>,
}