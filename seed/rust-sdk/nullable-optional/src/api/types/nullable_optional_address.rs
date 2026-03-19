pub use crate::prelude::*;

/// Nested object for testing
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Address {
    #[serde(default)]
    pub street: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub state: Option<String>,
    #[serde(rename = "zipCode")]
    #[serde(default)]
    pub zip_code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub country: Option<Option<String>>,
    #[serde(rename = "buildingId")]
    #[serde(default)]
    pub building_id: NullableUserId,
    #[serde(rename = "tenantId")]
    #[serde(default)]
    pub tenant_id: OptionalUserId,
}
