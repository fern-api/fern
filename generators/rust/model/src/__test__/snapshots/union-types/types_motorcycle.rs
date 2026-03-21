pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Motorcycle {
    #[serde(default)]
    pub engine_size: f64,
    #[serde(default)]
    pub has_sidecar: bool,
}