pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Truck {
    #[serde(default)]
    pub payload_capacity: f64,
    #[serde(default)]
    pub axles: i64,
}