pub use crate::prelude::*;

/// Query parameters for listResources
///
/// Request type for the ListResourcesQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListResourcesQueryRequest {
    pub page_limit: i64,
    #[serde(rename = "beforeDate")]
    pub before_date: NaiveDate,
}
