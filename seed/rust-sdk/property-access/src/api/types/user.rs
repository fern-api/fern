pub use crate::prelude::*;

/// User object
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct User {
    /// The unique identifier for the user.
    #[serde(default)]
    pub id: String,
    /// The email address of the user.
    #[serde(default)]
    pub email: String,
    /// The password for the user.
    #[serde(default)]
    pub password: String,
    /// User profile object
    #[serde(default)]
    pub profile: UserProfile,
}
