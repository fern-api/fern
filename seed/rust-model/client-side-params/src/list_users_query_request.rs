pub use crate::prelude::*;

/// Query parameters for listUsers
///
/// Request type for the ListUsersQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersQueryRequest {
    /// Page index of the results to return. First page is 0.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    /// Number of results per page.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<i64>,
    /// Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_totals: Option<bool>,
    /// Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sort: Option<String>,
    /// Connection filter
    #[serde(skip_serializing_if = "Option::is_none")]
    pub connection: Option<String>,
    /// Query string following Lucene query string syntax
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q: Option<String>,
    /// Search engine version (v1, v2, or v3)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub search_engine: Option<String>,
    /// Comma-separated list of fields to include or exclude
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
}
