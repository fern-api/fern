pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum KeywordUnion {
        #[serde(rename = "static")]
        #[non_exhaustive]
        Static {
            #[serde(default)]
            value: String,
        },

        #[serde(rename = "override")]
        #[non_exhaustive]
        Override {
            #[serde(default)]
            priority: i64,
        },

        #[serde(rename = "unknown")]
        #[non_exhaustive]
        Unknown {
            #[serde(default)]
            payload: String,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl KeywordUnion {
    pub fn r#static(value: String) -> Self {
        Self::Static { value }
    }

    pub fn r#override(priority: i64) -> Self {
        Self::Override { priority }
    }

    pub fn unknown(payload: String) -> Self {
        Self::Unknown { payload }
    }

    pub fn unknown_value(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
