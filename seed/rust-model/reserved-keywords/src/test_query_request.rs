pub use crate::prelude::*;

/// Query parameters for test
///
/// Request type for the TestQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestQueryRequest {
    pub r#for: String,
}
