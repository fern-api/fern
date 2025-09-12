use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreateUsernameBody {
    pub username: String,
    pub password: String,
    pub name: String,
}