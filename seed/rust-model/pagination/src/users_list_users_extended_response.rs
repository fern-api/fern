pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UsersListUsersExtendedResponse {
    #[serde(flatten)]
    pub user_page_fields: UsersUserPage,
    /// The totall number of /users
    pub total_count: i64,
}