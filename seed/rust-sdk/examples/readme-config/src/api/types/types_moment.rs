use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Moment {
    pub id: Uuid,
    pub date: NaiveDate,
    pub datetime: DateTime<Utc>,
}
