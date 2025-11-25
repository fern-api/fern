pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PostSubmitRequest {
    /// The user's username
    pub username: String,
    /// The user's email address
    pub email: String,
}
