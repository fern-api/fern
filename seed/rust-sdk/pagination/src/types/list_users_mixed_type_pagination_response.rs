use crate::user::User;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListUsersMixedTypePaginationResponse {
    pub next: String,
    pub data: Vec<User>,
}