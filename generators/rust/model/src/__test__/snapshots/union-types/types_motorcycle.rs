use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Motorcycle {
    pub engine_size: f64,
    pub has_sidecar: bool,
}