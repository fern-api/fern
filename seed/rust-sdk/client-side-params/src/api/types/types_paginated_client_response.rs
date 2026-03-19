pub use crate::prelude::*;

/// Paginated response for clients listing
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PaginatedClientResponse {
    /// Starting index (zero-based)
    #[serde(default)]
    pub start: i64,
    /// Number of items requested
    #[serde(default)]
    pub limit: i64,
    /// Number of items returned
    #[serde(default)]
    pub length: i64,
    /// Total number of items (when include_totals=true)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<i64>,
    /// List of clients
    #[serde(default)]
    pub clients: Vec<Client>,
}
