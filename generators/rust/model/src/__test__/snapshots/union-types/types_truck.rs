pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesTruck {
    pub payload_capacity: f64,
    pub axles: i64,
}