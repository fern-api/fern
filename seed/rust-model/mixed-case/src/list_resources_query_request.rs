use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListResourcesQueryRequest {
    pub page_limit: i64,
    #[serde(rename = "beforeDate")]
    pub before_date: NaiveDate,
}