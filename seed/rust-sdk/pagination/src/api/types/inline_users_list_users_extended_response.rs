pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersListUsersExtendedResponse {
    #[serde(flatten)]
    pub inline_users_user_page_fields: InlineUsersUserPage,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
}

impl InlineUsersListUsersExtendedResponse {
    pub fn builder() -> InlineUsersListUsersExtendedResponseBuilder {
        <InlineUsersListUsersExtendedResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersListUsersExtendedResponseBuilder {
    inline_users_user_page_fields: Option<InlineUsersUserPage>,
    total_count: Option<i64>,
}

impl InlineUsersListUsersExtendedResponseBuilder {
    pub fn inline_users_user_page_fields(mut self, value: InlineUsersUserPage) -> Self {
        self.inline_users_user_page_fields = Some(value);
        self
    }

    pub fn total_count(mut self, value: i64) -> Self {
        self.total_count = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersListUsersExtendedResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`inline_users_user_page_fields`](InlineUsersListUsersExtendedResponseBuilder::inline_users_user_page_fields)
    /// - [`total_count`](InlineUsersListUsersExtendedResponseBuilder::total_count)
    pub fn build(self) -> Result<InlineUsersListUsersExtendedResponse, BuildError> {
        Ok(InlineUsersListUsersExtendedResponse {
            inline_users_user_page_fields: self
                .inline_users_user_page_fields
                .ok_or_else(|| BuildError::missing_field("inline_users_user_page_fields"))?,
            total_count: self
                .total_count
                .ok_or_else(|| BuildError::missing_field("total_count"))?,
        })
    }
}
