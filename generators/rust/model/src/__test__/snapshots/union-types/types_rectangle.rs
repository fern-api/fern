pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesRectangle {
    pub width: f64,
    pub height: f64,
}