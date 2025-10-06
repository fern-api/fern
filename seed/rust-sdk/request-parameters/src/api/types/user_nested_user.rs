pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserNestedUser {
    pub name: String,
    pub user: UserUser,
}
