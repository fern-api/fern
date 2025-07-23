use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithDuplicatePrimitive {
        Integer1 {
            value: i32,
        },

        Integer2 {
            value: i32,
        },

        String1 {
            value: String,
        },

        String2 {
            value: String,
        },
}
