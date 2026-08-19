pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "resource_type")]
#[non_exhaustive]
pub enum Resource {
    #[serde(rename = "user")]
    #[non_exhaustive]
    User {
        #[serde(flatten)]
        data: User,
        status: ResourceStatus,
    },

    #[non_exhaustive]
    Organization {
        #[serde(default)]
        name: String,
        status: ResourceStatus,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl Resource {
    pub fn user(data: User, status: ResourceStatus) -> Self {
        Self::User { data, status }
    }

    pub fn organization(name: String, status: ResourceStatus) -> Self {
        Self::Organization { name, status }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }

    pub fn get_status(&self) -> &ResourceStatus {
        match self {
            Self::User { status, .. } => status,
            Self::Organization { status, .. } => status,
            Self::__Unknown(_) => panic!(
                "get_status() called on __Unknown variant; inspect the raw JSON value directly"
            ),
        }
    }
}
