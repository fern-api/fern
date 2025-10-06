pub use crate::prelude::*;

/// Paginated response for clients listing
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaginatedClientResponse {
    /// Starting index (zero-based)
    pub start: i64,
    /// Number of items requested
    pub limit: i64,
    /// Number of items returned
    pub length: i64,
    /// Total number of items (when include_totals=true)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<i64>,
    /// List of clients
    pub clients: Vec<Client>,
}