pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithTime {
    #[serde(rename = "value")]
    #[non_exhaustive]
    Value { value: i64 },

    #[serde(rename = "date")]
    #[non_exhaustive]
    Date { value: NaiveDate },

    #[serde(rename = "datetime")]
    #[non_exhaustive]
    Datetime {
        #[serde(with = "crate::core::flexible_datetime::offset")]
        value: DateTime<FixedOffset>,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
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

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
