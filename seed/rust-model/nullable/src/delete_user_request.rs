pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DeleteUserRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<Option<String>>,
}