pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "resource_type")]
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
}

impl Resource {
    pub fn user(data: User, status: ResourceStatus) -> Self {
        Self::User { data, status }
    }

    pub fn organization(name: String, status: ResourceStatus) -> Self {
        Self::Organization { name, status }
    }

    pub fn get_status(&self) -> &ResourceStatus {
        match self {
                    Self::User { status, .. } => status,
                    Self::Organization { status, .. } => status,
                }
    }
}
