pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithSameNumberTypes {
        #[serde(rename = "positiveInt")]
        PositiveInt {
            value: i64,
        },

        #[serde(rename = "negativeInt")]
        NegativeInt {
            value: i64,
        },

        #[serde(rename = "anyNumber")]
        AnyNumber {
            value: f64,
        },
}
