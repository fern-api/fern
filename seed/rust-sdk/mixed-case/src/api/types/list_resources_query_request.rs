pub use crate::prelude::*;

/// Query parameters for listResources
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListResourcesQueryRequest {
    #[serde(default)]
    pub page_limit: i64,
    #[serde(rename = "beforeDate")]
    #[serde(default)]
    pub before_date: NaiveDate,
}
