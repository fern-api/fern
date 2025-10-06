pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserUser {
    pub id: Id,
    pub name: String,
    pub age: i64,
}
