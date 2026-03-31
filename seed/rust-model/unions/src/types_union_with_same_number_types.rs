pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithSameNumberTypes {
        #[serde(rename = "positiveInt")]
        #[non_exhaustive]
        PositiveInt {
            value: i64,
        },

        #[serde(rename = "negativeInt")]
        #[non_exhaustive]
        NegativeInt {
            value: i64,
        },

        #[serde(rename = "anyNumber")]
        #[non_exhaustive]
        AnyNumber {
            value: f64,
        },
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
}
