pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetResourceQueryRequest {
    pub include_metadata: bool,
    pub format: String,
}

