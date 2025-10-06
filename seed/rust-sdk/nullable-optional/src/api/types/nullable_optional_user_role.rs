pub use crate::prelude::*;

/// Test enum for nullable enum fields
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UserRole {
    #[serde(rename = "ADMIN")]
    Admin,
    #[serde(rename = "USER")]
    User,
    #[serde(rename = "GUEST")]
    Guest,
    #[serde(rename = "MODERATOR")]
    Moderator,
}
impl fmt::Display for UserRole {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Admin => "ADMIN",
            Self::User => "USER",
            Self::Guest => "GUEST",
            Self::Moderator => "MODERATOR",
        };
        write!(f, "{}", s)
    }
}
