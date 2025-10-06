pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct OrganizationOrganization {
    pub id: Id,
    pub name: String,
    pub users: Vec<UserUser>,
}