pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct WithMetadata {
    #[serde(default)]
    pub metadata: HashMap<String, String>,
}