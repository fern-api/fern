pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder, Default, PartialEq, Eq, Hash)]
#[builder(setter(into, strip_option), build_fn(error = "derive_builder::UninitializedFieldError"))]
pub struct PutResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[builder(default, setter(into, strip_option))]
    pub errors: Option<Vec<Error>>,
}