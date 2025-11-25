pub use crate::prelude::*;

/// Query parameters for listWithOffsetStepPagination
///
/// Request type for the UsersListWithOffsetStepPaginationQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListWithOffsetStepPaginationQueryRequest {
    /// Defaults to first page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    /// The maximum number of elements to return.
    /// This is also used as the step size in this
    /// paginated endpoint.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<Order2>,
}
