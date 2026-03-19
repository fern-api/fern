pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Circle {
    #[serde(default)]
    pub radius: f64,
}