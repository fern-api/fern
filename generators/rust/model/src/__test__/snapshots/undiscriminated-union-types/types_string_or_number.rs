pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum StringOrNumber {
        #[serde(rename = "string")]
        r#String {
            value: String,
        },

        Number {
            value: i64,
        },
}
