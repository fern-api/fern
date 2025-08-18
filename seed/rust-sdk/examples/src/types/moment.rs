use chrono::{DateTime, NaiveDate, Utc};
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Moment {
    pub id: uuid::Uuid,
    pub date: chrono::NaiveDate,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub datetime: chrono::DateTime<chrono::Utc>,
}