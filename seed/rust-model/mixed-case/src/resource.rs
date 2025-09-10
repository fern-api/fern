use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "resource_type")]
pub enum Resource {
        User {
            #[serde(flatten)]
            data: User,
            status: ResourceStatus,
        },

        Organization {
            #[serde(flatten)]
            data: Organization,
            status: ResourceStatus,
        },
}

impl Resource {
    pub fn get_status(&self) -> &ResourceStatus {
        match self {
                    Self::User { status, .. } => status,
                    Self::Organization { status, .. } => status,
                }
    }

}
