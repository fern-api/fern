pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreateUserRequest {
    /// The name of the user to create.
    /// This name is unique to each user.
    pub name: String,
    /// The age of the user.
    /// This property is not required.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<i64>,
}
