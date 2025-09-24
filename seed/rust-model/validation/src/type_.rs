use crate::shape::Shape;
use serde::{Deserialize, Serialize};

/// Defines properties with default values and validation rules.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Type {
    pub decimal: f64,
    pub even: i32,
    pub name: String,
    pub shape: Shape,
}