pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesStringOrNumber {
        String {
            value: String,
        },

        Number {
            value: i64,
        },
}
