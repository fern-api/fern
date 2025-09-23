use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListResourcesQueryRequest {
    pub page_limit: i32,
    #[serde(rename = "beforeDate")]
    pub before_date: chrono::NaiveDate,
}
