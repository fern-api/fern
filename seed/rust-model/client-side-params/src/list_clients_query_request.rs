pub use crate::prelude::*;

/// Query parameters for listClients
///
/// Request type for the ListClientsQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListClientsQueryRequest {
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    /// Whether specified fields are included or excluded
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_fields: Option<bool>,
    /// Page number (zero-based)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    /// Number of results per page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<i64>,
    /// Include total count in response
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_totals: Option<bool>,
    /// Filter by global clients
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_global: Option<bool>,
    /// Filter by first party clients
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_first_party: Option<bool>,
    /// Filter by application type (spa, native, regular_web, non_interactive)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_type: Option<Vec<String>>,
}
