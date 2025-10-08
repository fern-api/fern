pub use crate::prelude::*;

/// User object
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct User {
    /// The unique identifier for the user.
    pub id: String,
    /// The email address of the user.
    pub email: String,
    /// The password for the user.
    pub password: String,
    /// User profile object
    pub profile: UserProfile,
}