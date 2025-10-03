pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreateUserRequest {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<i64>,
}

