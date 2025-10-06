pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "resource_type")]
pub enum ServiceResource {
    User {
        #[serde(flatten)]
        data: ServiceUser,
        status: ServiceResourceStatus,
    },

    Organization {
        #[serde(flatten)]
        data: ServiceOrganization,
        status: ServiceResourceStatus,
    },
}

impl ServiceResource {
    pub fn get_status(&self) -> &ServiceResourceStatus {
        match self {
            Self::User { status, .. } => status,
            Self::Organization { status, .. } => status,
        }
    }
}
