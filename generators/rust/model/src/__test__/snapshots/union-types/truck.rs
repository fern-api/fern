use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Truck {
    pub payload_capacity: f64,
    pub axles: i32,
}