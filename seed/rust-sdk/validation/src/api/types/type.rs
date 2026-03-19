pub use crate::prelude::*;

/// Defines properties with default values and validation rules.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Type {
    #[serde(default)]
    pub decimal: f64,
    #[serde(default)]
    pub even: i64,
    #[serde(default)]
    pub name: String,
    pub shape: Shape,
}
