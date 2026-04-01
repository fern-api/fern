pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder, PartialEq, Eq, Hash)]
#[builder(setter(into, strip_option), build_fn(error = "derive_builder::UninitializedFieldError"))]
pub struct Error {
    pub category: ErrorCategory,
    pub code: ErrorCode,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[builder(default, setter(into, strip_option))]
    pub detail: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[builder(default, setter(into, strip_option))]
    pub field: Option<String>,
}