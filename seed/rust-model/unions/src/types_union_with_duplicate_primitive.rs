pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithDuplicatePrimitive {
        Integer1 {
            value: i64,
        },

        Integer2 {
            value: i64,
        },

        String1 {
            value: String,
        },

        String2 {
            value: String,
        },
}
