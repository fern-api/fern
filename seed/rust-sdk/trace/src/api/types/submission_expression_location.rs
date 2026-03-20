pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ExpressionLocation {
    #[serde(default)]
    pub start: i64,
    #[serde(default)]
    pub offset: i64,
}