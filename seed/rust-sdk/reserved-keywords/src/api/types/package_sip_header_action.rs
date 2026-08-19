pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum SipHeaderAction {
    #[serde(rename = "static")]
    #[non_exhaustive]
    Static {
        #[serde(flatten)]
        data: CustomSipHeader,
    },

    #[serde(rename = "dynamic")]
    #[non_exhaustive]
    Dynamic {
        #[serde(flatten)]
        data: CustomSipHeader,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl SipHeaderAction {
    pub fn r#static(data: CustomSipHeader) -> Self {
        Self::Static { data }
    }

    pub fn dynamic(data: CustomSipHeader) -> Self {
        Self::Dynamic { data }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
