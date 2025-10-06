pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FilterByRoleQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<NullableOptionalUserRole>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<NullableOptionalUserStatus>,
    #[serde(rename = "secondaryRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub secondary_role: Option<Option<NullableOptionalUserRole>>,
}
