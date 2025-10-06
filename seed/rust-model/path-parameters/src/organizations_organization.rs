pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct OrganizationsOrganization {
    pub name: String,
    pub tags: Vec<String>,
}