use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum StringOrNumber {
        String {
            value: String,
        },

        Number {
            value: i64,
        },
}
