pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersUserListContainer {
    pub users: Vec<InlineUsersInlineUsersUser>,
}
