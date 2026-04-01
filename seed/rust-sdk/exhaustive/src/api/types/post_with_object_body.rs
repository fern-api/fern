pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder, Default, PartialEq)]
#[builder(
    setter(into, strip_option),
    build_fn(error = "derive_builder::UninitializedFieldError")
)]
pub struct PostWithObjectBody {
    #[serde(default)]
    pub string: String,
    #[serde(default)]
    pub integer: i64,
    #[serde(rename = "NestedObject")]
    #[serde(default)]
    pub nested_object: ObjectWithOptionalField,
}
