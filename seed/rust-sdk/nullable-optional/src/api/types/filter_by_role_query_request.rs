use crate::nullable_optional_user_role::UserRole;
use crate::nullable_optional_user_status::UserStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FilterByRoleQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<UserRole>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<UserStatus>,
    #[serde(rename = "secondaryRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub secondary_role: Option<Option<UserRole>>,
}
