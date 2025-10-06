pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UsersUserListContainer {
    pub users: Vec<UsersUser>,
}