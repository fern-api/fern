pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Truck {
    pub payload_capacity: f64,
    pub axles: i64,
}