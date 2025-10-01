use crate::user_profile_verification::UserProfileVerification;
use serde::{Deserialize, Serialize};

/// User profile object
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserProfile {
    /// The name of the user.
    pub name: String,
    /// User profile verification object
    pub verification: UserProfileVerification,
    /// The social security number of the user.
    pub ssn: String,
}
