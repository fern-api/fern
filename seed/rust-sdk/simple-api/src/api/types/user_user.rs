pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserUser {
    pub id: String,
    pub name: String,
    pub email: String,
}
