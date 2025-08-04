use crate::user::User;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NestedUser {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "NestedUser")]
    pub nested_user: User,
}