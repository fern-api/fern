pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithTime {
        #[serde(rename = "value")]
        #[non_exhaustive]
        Value {
            value: i64,
        },

        #[serde(rename = "date")]
        #[non_exhaustive]
        Date {
            value: NaiveDate,
        },

        #[serde(rename = "datetime")]
        #[non_exhaustive]
        Datetime {
            #[serde(with = "crate::core::flexible_datetime::offset")]
            value: DateTime<FixedOffset>,
        },
}

impl UnionWithTime {
    pub fn value(value: i64) -> Self {
        Self::Value { value }
    }

    pub fn date(value: NaiveDate) -> Self {
        Self::Date { value }
    }

    pub fn datetime(value: DateTime<FixedOffset>) -> Self {
        Self::Datetime { value }
    }
}
