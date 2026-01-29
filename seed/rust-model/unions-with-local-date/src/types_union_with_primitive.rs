pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithPrimitive {
        #[serde(rename = "integer")]
        Integer {
            value: i64,
        },

        #[serde(rename = "string")]
        r#String {
            value: String,
        },
}
