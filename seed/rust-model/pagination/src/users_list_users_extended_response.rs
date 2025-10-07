pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListUsersExtendedResponse2 {
    #[serde(flatten)]
    pub user_page_fields: UserPage2,
    /// The totall number of /users
    pub total_count: i64,
}