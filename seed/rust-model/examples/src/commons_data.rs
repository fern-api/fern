pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum CommonsData {
        #[serde(rename = "string")]
        #[non_exhaustive]
        r#String {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<String>,
        },

        #[serde(rename = "base64")]
        #[non_exhaustive]
        Base64 {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<String>,
        },
}

impl CommonsData {
    pub fn string() -> Self {
        Self::r#String { value: None }
    }

    pub fn base64() -> Self {
        Self::Base64 { value: None }
    }

    pub fn string_with_value(value: String) -> Self {
        Self::r#String { value: Some(value) }
    }

    pub fn base64_with_value(value: String) -> Self {
        Self::Base64 { value: Some(value) }
    }
}
