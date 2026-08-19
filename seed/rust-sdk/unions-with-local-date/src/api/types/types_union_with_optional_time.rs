pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
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

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithOptionalTime {
    pub fn date(value: Option<NaiveDate>) -> Self {
        Self::Date { value }
    }

    pub fn datetime(value: Option<DateTime<FixedOffset>>) -> Self {
        Self::Datetime { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
