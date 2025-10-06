pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesUser {
    pub id: String,
    pub name: String,
    pub email: String,
}