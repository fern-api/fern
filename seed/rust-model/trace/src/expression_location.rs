use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ExpressionLocation {
    pub start: i32,
    pub offset: i32,
}