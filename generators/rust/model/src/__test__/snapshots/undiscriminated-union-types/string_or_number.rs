use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum StringOrNumber {
        String {
            value: String,
        },

        Number {
            value: i32,
        },
}
