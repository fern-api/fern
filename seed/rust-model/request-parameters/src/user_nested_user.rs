pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NestedUser {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub user: User,
}