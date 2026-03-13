pub use crate::prelude::*;

/// Tests that unknown types are able to preserve their type names.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectWithDocumentedUnknownType {
    #[serde(rename = "documentedUnknownType")]
    pub documented_unknown_type: DocumentedUnknownType,
}
