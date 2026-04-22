pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithOptionalTime {
    #[serde(rename = "date")]
    #[non_exhaustive]
    Date { value: Option<NaiveDate> },

    #[serde(rename = "datetime")]
    #[non_exhaustive]
    Datetime {
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        value: Option<DateTime<FixedOffset>>,
    },
}

impl UnionWithOptionalTime {
    pub fn date(value: Option<NaiveDate>) -> Self {
        Self::Date { value }
    }

    pub fn datetime(value: Option<DateTime<FixedOffset>>) -> Self {
        Self::Datetime { value }
    }
}
