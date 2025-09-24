use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum UnionWithSameNumberTypes {
    PositiveInt { value: i32 },

    NegativeInt { value: i32 },

    AnyNumber { value: f64 },
}
