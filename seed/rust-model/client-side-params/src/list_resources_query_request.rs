pub use crate::prelude::*;

/// Query parameters for listResources
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListResourcesQueryRequest {
    /// Zero-indexed page number
    #[serde(default)]
    pub page: i64,
    /// Number of items per page
    #[serde(default)]
    pub per_page: i64,
    /// Sort field
    #[serde(default)]
    pub sort: String,
    /// Sort order (asc or desc)
    #[serde(default)]
    pub order: String,
    /// Whether to include total count
    #[serde(default)]
    pub include_totals: bool,
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    /// Search query
    #[serde(skip_serializing_if = "Option::is_none")]
    pub search: Option<String>,
}
