pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DeleteUserRequest {
    /// The user to delete.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
}
