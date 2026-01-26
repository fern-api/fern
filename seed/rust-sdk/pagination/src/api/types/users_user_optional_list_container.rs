pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserOptionalListContainer2 {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub users: Option<Vec<User2>>,
}