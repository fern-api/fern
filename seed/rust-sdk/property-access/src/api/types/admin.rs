pub use crate::prelude::*;

/// Admin user object
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Admin {
    #[serde(flatten)]
    pub user_fields: User,
    /// The level of admin privileges.
    #[serde(rename = "adminLevel")]
    pub admin_level: String,
}