pub use crate::prelude::*;

/// Tests that unknown types are able to preserve their type names.
#[derive(Debug, Clone, Serialize, Deserialize, Builder, Default, PartialEq)]
#[builder(
    setter(into, strip_option),
    build_fn(error = "derive_builder::UninitializedFieldError")
)]
pub struct ObjectWithDocumentedUnknownType {
    #[serde(rename = "documentedUnknownType")]
    pub documented_unknown_type: DocumentedUnknownType,
}
