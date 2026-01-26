pub use crate::prelude::*;

/// User profile verification object
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserProfileVerification {
    /// User profile verification status
    pub verified: String,
}