pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WithMetadata {
    pub metadata: HashMap<String, String>,
}