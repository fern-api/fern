use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithSameStringTypes {
        CustomFormat {
            value: String,
        },

        RegularString {
            value: String,
        },

        PatternString {
            value: String,
        },
}
