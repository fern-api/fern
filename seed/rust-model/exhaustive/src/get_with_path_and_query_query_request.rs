pub use crate::prelude::*;

/// Query parameters for getWithPathAndQuery
#[derive(Debug, Clone, Serialize, Deserialize, Builder, Default, PartialEq, Eq, Hash)]
#[builder(setter(into, strip_option), build_fn(error = "derive_builder::UninitializedFieldError"))]
pub struct GetWithPathAndQueryQueryRequest {
    #[serde(default)]
    pub query: String,
}
