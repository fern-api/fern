pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithSameStringTypes {
        #[serde(rename = "customFormat")]
        CustomFormat {
            value: String,
        },

        #[serde(rename = "regularString")]
        RegularString {
            value: String,
        },

        #[serde(rename = "patternString")]
        PatternString {
            value: String,
        },
}
