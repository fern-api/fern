pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CreateRequest {
    pub decimal: f64,
    pub even: i64,
    pub name: String,
    pub shape: Shape,
}
