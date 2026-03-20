pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateOrganizationRequest {
    #[serde(default)]
    pub name: String,
}