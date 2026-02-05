pub use crate::prelude::*;

/// Query parameters for listWithDoubleOffsetPagination
///
/// Request type for the UsersListWithDoubleOffsetPaginationQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct UsersListWithDoubleOffsetPaginationQueryRequest {
    /// Defaults to first page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<f64>,
    /// Defaults to per page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<Order2>,
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}
