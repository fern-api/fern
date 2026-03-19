pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersExtendedResponse {
    #[serde(flatten)]
    pub user_page_fields: UserPage,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
}