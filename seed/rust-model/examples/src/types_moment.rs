pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Moment {
    pub id: Uuid,
    pub date: NaiveDate,
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub datetime: DateTime<FixedOffset>,
}