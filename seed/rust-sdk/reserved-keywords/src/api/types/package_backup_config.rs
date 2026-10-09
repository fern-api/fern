pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum BackupConfig {
    #[serde(rename = "override")]
    #[non_exhaustive]
    Override {
        #[serde(flatten)]
        data: BackupOverride,
    },

    #[serde(rename = "fallback")]
    #[non_exhaustive]
    Fallback {
        #[serde(flatten)]
        data: BackupOverride,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl BackupConfig {
    pub fn r#override(data: BackupOverride) -> Self {
        Self::Override { data }
    }

    pub fn fallback(data: BackupOverride) -> Self {
        Self::Fallback { data }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
