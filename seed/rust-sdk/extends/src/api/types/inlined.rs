pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Inlined {
    #[serde(default)]
    pub unique: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub docs: String,
}
