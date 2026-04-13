pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithOptionalTime {
        #[serde(rename = "date")]
        #[non_exhaustive]
        Date {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<NaiveDate>,
        },

        #[serde(rename = "datetime")]
        #[non_exhaustive]
        Datetime {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<DateTime<FixedOffset>>,
        },
}

impl UnionWithOptionalTime {
    pub fn date() -> Self {
        Self::Date { value: None }
    }

    pub fn datetime() -> Self {
        Self::Datetime { value: None }
    }

    pub fn date_with_value(value: NaiveDate) -> Self {
        Self::Date { value: Some(value) }
    }

    pub fn datetime_with_value(value: DateTime<FixedOffset>) -> Self {
        Self::Datetime { value: Some(value) }
    }
}
