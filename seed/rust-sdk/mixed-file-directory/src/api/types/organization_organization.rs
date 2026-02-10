pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Organization {
    pub id: Id,
    pub name: String,
    pub users: Vec<User>,
}