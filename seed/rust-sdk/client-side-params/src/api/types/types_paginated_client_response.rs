use crate::types_client::Client;
use serde::{Deserialize, Serialize};

/// Paginated response for clients listing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedClientResponse {
    /// Starting index (zero-based)
    pub start: i32,
    /// Number of items requested
    pub limit: i32,
    /// Number of items returned
    pub length: i32,
    /// Total number of items (when include_totals=true)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<i32>,
    /// List of clients
    pub clients: Vec<Client>,
}
