pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesMotorcycle {
    pub engine_size: f64,
    pub has_sidecar: bool,
}