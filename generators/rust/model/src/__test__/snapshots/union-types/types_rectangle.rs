pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Rectangle {
    #[serde(default)]
    pub width: f64,
    #[serde(default)]
    pub height: f64,
}