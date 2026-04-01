pub use crate::prelude::*;

/// Query parameters for getWithAllowMultipleQuery
#[derive(Debug, Clone, Serialize, Deserialize, Builder, Default, PartialEq, Eq, Hash)]
#[builder(
    setter(into, strip_option),
    build_fn(error = "derive_builder::UninitializedFieldError")
)]
pub struct GetWithAllowMultipleQueryQueryRequest {
    #[serde(default)]
    pub query: Vec<String>,
    #[serde(default)]
    pub number: Vec<i64>,
}
