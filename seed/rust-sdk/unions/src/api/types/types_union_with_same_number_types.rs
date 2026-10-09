pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithSameNumberTypes {
    #[serde(rename = "positiveInt")]
    #[non_exhaustive]
    PositiveInt { value: i64 },

    #[serde(rename = "negativeInt")]
    #[non_exhaustive]
    NegativeInt { value: i64 },

    #[serde(rename = "anyNumber")]
    #[non_exhaustive]
    AnyNumber { value: f64 },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithSameNumberTypes {
    pub fn positive_int(value: i64) -> Self {
        Self::PositiveInt { value }
    }

    pub fn negative_int(value: i64) -> Self {
        Self::NegativeInt { value }
    }

    pub fn any_number(value: f64) -> Self {
        Self::AnyNumber { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
