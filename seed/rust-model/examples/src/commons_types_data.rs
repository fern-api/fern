pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Data {
        #[serde(rename = "string")]
        #[non_exhaustive]
        r#String {
            value: String,
        },

        #[serde(rename = "base64")]
        #[non_exhaustive]
        Base64 {
            value: Vec<u8>,
        },
}

impl Data {
    pub fn string(value: String) -> Self {
        Self::r#String { value }
    }

    pub fn base64(value: Vec<u8>) -> Self {
        Self::Base64 { value }
    }
}
