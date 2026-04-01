pub use crate::prelude::*;

/// Query parameters for getWithQuery
#[derive(Debug, Clone, Serialize, Deserialize, Builder, Default, PartialEq, Eq, Hash)]
#[builder(
    setter(into, strip_option),
    build_fn(error = "derive_builder::UninitializedFieldError")
)]
pub struct GetWithQueryQueryRequest {
    #[serde(default)]
    pub query: String,
    #[serde(default)]
    pub number: i64,
}
