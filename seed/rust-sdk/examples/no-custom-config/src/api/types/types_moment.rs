pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Moment {
    pub id: Uuid,
    pub date: NaiveDate,
    pub datetime: DateTime<Utc>,
}
