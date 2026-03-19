pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserListContainer {
    #[serde(default)]
    pub users: Vec<User>,
}