use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ExpressionLocation {
    pub start: i64,
    pub offset: i64,
}
