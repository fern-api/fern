pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithDuplicatePrimitive {
        #[serde(rename = "integer1")]
        Integer1 {
            value: i64,
        },

        #[serde(rename = "integer2")]
        Integer2 {
            value: i64,
        },

        #[serde(rename = "string1")]
        String1 {
            value: String,
        },

        #[serde(rename = "string2")]
        String2 {
            value: String,
        },
}
