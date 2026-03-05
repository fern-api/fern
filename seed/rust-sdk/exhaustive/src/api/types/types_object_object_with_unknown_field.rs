pub use crate::prelude::*;

/// Tests that unknown/any values containing backslashes in map keys
/// are properly escaped in Go string literals.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectWithUnknownField {
    pub unknown: serde_json::Value,
}
