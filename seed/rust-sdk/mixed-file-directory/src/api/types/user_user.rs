pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct User {
    pub id: Id,
    pub name: String,
    pub age: i64,
}