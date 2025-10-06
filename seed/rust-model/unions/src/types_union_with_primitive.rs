pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesUnionWithPrimitive {
        Integer {
            value: i64,
        },

        String {
            value: String,
        },
}
