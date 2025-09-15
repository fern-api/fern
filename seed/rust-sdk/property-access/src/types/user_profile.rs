use crate::user_profile_verification::UserProfileVerification;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserProfile {
    pub name: String,
    pub verification: UserProfileVerification,
    pub ssn: String,
}