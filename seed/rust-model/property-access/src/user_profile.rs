pub use crate::prelude::*;

/// User profile object
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserProfile {
    /// The name of the user.
    #[serde(default)]
    pub name: String,
    /// User profile verification object
    #[serde(default)]
    pub verification: UserProfileVerification,
    /// The social security number of the user.
    #[serde(default)]
    pub ssn: String,
}