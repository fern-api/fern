pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithTime {
        #[serde(rename = "value")]
        Value {
            value: i64,
        },

        #[serde(rename = "date")]
        Date {
            value: NaiveDate,
        },

        #[serde(rename = "datetime")]
        Datetime {
            #[serde(with = "crate::core::flexible_datetime::offset")]
            value: DateTime<FixedOffset>,
        },
}
