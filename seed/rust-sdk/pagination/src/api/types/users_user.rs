pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UsersUser {
    pub name: String,
    pub id: i64,
}
