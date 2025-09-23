use crate::user_profile::UserProfile;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct User {
    pub id: String,
    pub email: String,
    pub password: String,
    pub profile: UserProfile,
}
