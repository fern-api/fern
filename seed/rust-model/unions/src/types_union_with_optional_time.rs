pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithOptionalTime {
        Date {
            value: Option<NaiveDate>,
        },

        Datetime {
            value: Option<DateTime<Utc>>,
        },
}
