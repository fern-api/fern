pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListResourcesQueryRequest {
    pub page_limit: i64,
    #[serde(rename = "beforeDate")]
    pub before_date: NaiveDate,
}

