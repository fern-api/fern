pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Users {
    #[serde(default)]
    pub users: Vec<User>,
}
