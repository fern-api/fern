pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithSameNumberTypes {
    PositiveInt { value: i64 },

    NegativeInt { value: i64 },

    AnyNumber { value: f64 },
}
