pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "kind")]
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
            data: String,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl KeywordUnion {
    pub fn static_(value: String) -> Self {
        Self::Static { value }
    }

    pub fn override_(priority: i64) -> Self {
        Self::Override { priority }
    }

    pub fn unknown(data: String) -> Self {
        Self::Unknown { data }
    }

    pub fn unknown_value(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
