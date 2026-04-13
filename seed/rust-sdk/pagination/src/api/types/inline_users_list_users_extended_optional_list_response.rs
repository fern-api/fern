pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersListUsersExtendedOptionalListResponse {
    #[serde(flatten)]
    pub inline_users_user_optional_list_page_fields: InlineUsersUserOptionalListPage,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
}

impl InlineUsersListUsersExtendedOptionalListResponse {
    pub fn builder() -> InlineUsersListUsersExtendedOptionalListResponseBuilder {
        <InlineUsersListUsersExtendedOptionalListResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersListUsersExtendedOptionalListResponseBuilder {
    inline_users_user_optional_list_page_fields: Option<InlineUsersUserOptionalListPage>,
    total_count: Option<i64>,
}

impl InlineUsersListUsersExtendedOptionalListResponseBuilder {
    pub fn inline_users_user_optional_list_page_fields(
        mut self,
        value: InlineUsersUserOptionalListPage,
    ) -> Self {
        self.inline_users_user_optional_list_page_fields = Some(value);
        self
    }

    pub fn total_count(mut self, value: i64) -> Self {
        self.total_count = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersListUsersExtendedOptionalListResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`inline_users_user_optional_list_page_fields`](InlineUsersListUsersExtendedOptionalListResponseBuilder::inline_users_user_optional_list_page_fields)
    /// - [`total_count`](InlineUsersListUsersExtendedOptionalListResponseBuilder::total_count)
    pub fn build(self) -> Result<InlineUsersListUsersExtendedOptionalListResponse, BuildError> {
        Ok(InlineUsersListUsersExtendedOptionalListResponse {
            inline_users_user_optional_list_page_fields: self
                .inline_users_user_optional_list_page_fields
                .ok_or_else(|| {
                    BuildError::missing_field("inline_users_user_optional_list_page_fields")
                })?,
            total_count: self
                .total_count
                .ok_or_else(|| BuildError::missing_field("total_count"))?,
        })
    }
}
