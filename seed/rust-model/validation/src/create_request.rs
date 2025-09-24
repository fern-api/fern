use crate::shape::Shape;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRequest {
    pub decimal: f64,
    pub even: i32,
    pub name: String,
    pub shape: Shape,
}