pub use crate::prelude::*;

/// Query parameters for listEvents
///
/// Request type for the ListEventsQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListEventsQueryRequest {
    /// The maximum number of results to return.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}
