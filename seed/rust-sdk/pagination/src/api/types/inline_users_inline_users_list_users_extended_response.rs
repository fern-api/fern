pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersExtendedResponse {
    #[serde(flatten)]
    pub user_page_fields: UserPage,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
}

impl ListUsersExtendedResponse {
    pub fn builder() -> ListUsersExtendedResponseBuilder {
        ListUsersExtendedResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersExtendedResponseBuilder {
    user_page_fields: Option<UserPage>,
    total_count: Option<i64>,
}

impl ListUsersExtendedResponseBuilder {
    pub fn user_page_fields(mut self, value: UserPage) -> Self {
        self.user_page_fields = Some(value);
        self
    }

    pub fn total_count(mut self, value: i64) -> Self {
        self.total_count = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersExtendedResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_page_fields`](ListUsersExtendedResponseBuilder::user_page_fields)
    /// - [`total_count`](ListUsersExtendedResponseBuilder::total_count)
    pub fn build(self) -> Result<ListUsersExtendedResponse, BuildError> {
        Ok(ListUsersExtendedResponse {
            user_page_fields: self
                .user_page_fields
                .ok_or_else(|| BuildError::missing_field("user_page_fields"))?,
            total_count: self
                .total_count
                .ok_or_else(|| BuildError::missing_field("total_count"))?,
        })
    }
}
