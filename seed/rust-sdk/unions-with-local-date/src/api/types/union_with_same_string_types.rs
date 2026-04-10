pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithSameStringTypes {
    #[serde(rename = "customFormat")]
    #[non_exhaustive]
    CustomFormat {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<String>,
    },

    #[serde(rename = "regularString")]
    #[non_exhaustive]
    RegularString {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<String>,
    },

    #[serde(rename = "patternString")]
    #[non_exhaustive]
    PatternString {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<String>,
    },
}

impl UnionWithSameStringTypes {
    pub fn custom_format() -> Self {
        Self::CustomFormat { value: None }
    }

    pub fn regular_string() -> Self {
        Self::RegularString { value: None }
    }

    pub fn pattern_string() -> Self {
        Self::PatternString { value: None }
    }

    pub fn custom_format_with_value(value: String) -> Self {
        Self::CustomFormat { value: Some(value) }
    }

    pub fn regular_string_with_value(value: String) -> Self {
        Self::RegularString { value: Some(value) }
    }

    pub fn pattern_string_with_value(value: String) -> Self {
        Self::PatternString { value: Some(value) }
    }
}
