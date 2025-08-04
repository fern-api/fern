use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Moment {
    pub id: uuid::Uuid,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub date: chrono::NaiveDate,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub datetime: chrono::DateTime<chrono::Utc>,
}