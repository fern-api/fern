use crate::user::User;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Admin {
    #[serde(flatten)]
    pub user_fields: User,
    #[serde(rename = "adminLevel")]
    pub admin_level: String,
}
