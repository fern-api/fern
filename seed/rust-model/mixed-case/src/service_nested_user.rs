pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ServiceNestedUser {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "NestedUser")]
    pub nested_user: ServiceUser,
}