pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithPrimitive {
        Integer {
            value: i64,
        },

        String {
            value: String,
        },
}
