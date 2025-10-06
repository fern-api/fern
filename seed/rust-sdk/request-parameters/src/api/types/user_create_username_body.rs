pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserCreateUsernameBody {
    pub username: String,
    pub password: String,
    pub name: String,
}
