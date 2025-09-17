use crate::inline_users_inline_users_user::User;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Users {
    pub users: Vec<User>,
}