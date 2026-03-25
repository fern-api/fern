pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum StringOrNumber {
        #[serde(rename = "string")]
        #[non_exhaustive]
        r#String {
            value: String,
        },

        #[serde(rename = "number")]
        #[non_exhaustive]
        Number {
            value: i64,
        },
}

impl StringOrNumber {
    pub fn string(value: String) -> Self {
        Self::r#String { value }
    }

    pub fn number(value: i64) -> Self {
        Self::Number { value }
    }
}
