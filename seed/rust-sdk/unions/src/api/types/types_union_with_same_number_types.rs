pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TypesUnionWithSameNumberTypes {
    PositiveInt { value: i64 },

    NegativeInt { value: i64 },

    AnyNumber { value: f64 },
}
