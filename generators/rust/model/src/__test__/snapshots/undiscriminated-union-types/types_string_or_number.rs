pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum StringOrNumber {
        #[serde(rename = "string")]
        r#String {
            value: String,
        },

        #[serde(rename = "number")]
        Number {
            value: i64,
        },
}
