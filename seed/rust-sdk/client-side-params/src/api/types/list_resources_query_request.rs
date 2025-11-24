pub use crate::prelude::*;

/// Query parameters for listResources
///
/// Request type for the ListResourcesQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListResourcesQueryRequest {
    /// Zero-indexed page number
    pub page: i64,
    /// Number of items per page
    pub per_page: i64,
    /// Sort field
    pub sort: String,
    /// Sort order (asc or desc)
    pub order: String,
    /// Whether to include total count
    pub include_totals: bool,
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    /// Search query
    #[serde(skip_serializing_if = "Option::is_none")]
    pub search: Option<String>,
}
