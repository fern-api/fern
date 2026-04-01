pub use crate::prelude::*;

/// Tests that unknown/any values containing backslashes in map keys
/// are properly escaped in Go string literals.
#[derive(Debug, Clone, Serialize, Deserialize, Builder, Default, PartialEq)]
#[builder(
    setter(into, strip_option),
    build_fn(error = "derive_builder::UninitializedFieldError")
)]
pub struct ObjectWithUnknownField {
    pub unknown: serde_json::Value,
}
