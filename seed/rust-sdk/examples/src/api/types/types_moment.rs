use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Moment {
    pub id: uuid::Uuid,
    pub date: chrono::NaiveDate,
    pub datetime: chrono::DateTime<chrono::Utc>,
}
