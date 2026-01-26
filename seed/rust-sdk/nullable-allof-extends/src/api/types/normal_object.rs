pub use crate::prelude::*;

/// A standard object with no nullable issues.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct NormalObject {
    #[serde(rename = "normalField")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub normal_field: Option<String>,
}