pub use crate::prelude::*;

/// Defines properties with default values and validation rules.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Type {
    pub decimal: f64,
    pub even: i64,
    pub name: String,
    pub shape: Shape,
}
