pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PostSubmitRequest {
    /// The user's username
    #[serde(default)]
    pub username: String,
    /// The user's email address
    #[serde(default)]
    pub email: String,
}
