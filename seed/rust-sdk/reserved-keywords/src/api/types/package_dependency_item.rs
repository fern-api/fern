pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum DependencyItem {
    #[serde(rename = "known")]
    #[non_exhaustive]
    Known {
        #[serde(flatten)]
        data: KnownDependency,
    },

    #[serde(rename = "unknown")]
    #[non_exhaustive]
    Unknown {
        #[serde(flatten)]
        data: KnownDependency,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl DependencyItem {
    pub fn known(data: KnownDependency) -> Self {
        Self::Known { data }
    }

    pub fn unknown(data: KnownDependency) -> Self {
        Self::Unknown { data }
    }
}
