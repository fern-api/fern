pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesMoment {
    pub id: Uuid,
    pub date: NaiveDate,
    pub datetime: DateTime<Utc>,
}