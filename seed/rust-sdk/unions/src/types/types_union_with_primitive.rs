use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithPrimitive {
        Integer {
            value: i32,
        },

        String {
            value: String,
        },
}
