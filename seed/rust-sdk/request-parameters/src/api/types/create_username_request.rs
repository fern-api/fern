pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreateUsernameRequest {
    pub username: String,
    pub password: String,
    pub name: String,
    pub tags: Vec<String>,
}
