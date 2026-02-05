pub use crate::prelude::*;

/// Nested object for testing
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Address {
    pub street: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub state: Option<String>,
    #[serde(rename = "zipCode")]
    pub zip_code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub country: Option<Option<String>>,
    #[serde(rename = "buildingId")]
    pub building_id: NullableUserId,
    #[serde(rename = "tenantId")]
    pub tenant_id: OptionalUserId,
}