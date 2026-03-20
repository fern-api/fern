pub use crate::prelude::*;

/// Query parameters for test
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestQueryRequest {
    #[serde(default)]
    pub r#for: String,
}
