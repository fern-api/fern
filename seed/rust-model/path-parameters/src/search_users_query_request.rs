pub use crate::prelude::*;

/// Query parameters for searchUsers
///
/// Request type for the SearchUsersQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SearchUsersQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}
