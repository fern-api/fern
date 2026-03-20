pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithSameStringTypes {
        #[serde(rename = "customFormat")]
        #[non_exhaustive]
        CustomFormat {
            value: String,
        },

        #[serde(rename = "regularString")]
        #[non_exhaustive]
        RegularString {
            value: String,
        },

        #[serde(rename = "patternString")]
        #[non_exhaustive]
        PatternString {
            value: String,
        },
}

impl UnionWithSameStringTypes {
    pub fn custom_format(value: String) -> Self {
        Self::CustomFormat { value }
    }

    pub fn regular_string(value: String) -> Self {
        Self::RegularString { value }
    }

    pub fn pattern_string(value: String) -> Self {
        Self::PatternString { value }
    }
}
