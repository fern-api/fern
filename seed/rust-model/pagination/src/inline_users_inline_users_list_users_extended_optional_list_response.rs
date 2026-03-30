pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersExtendedOptionalListResponse {
    #[serde(flatten)]
    pub user_optional_list_page_fields: UserOptionalListPage,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
}

impl ListUsersExtendedOptionalListResponse {
    pub fn builder() -> ListUsersExtendedOptionalListResponseBuilder {
        <ListUsersExtendedOptionalListResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersExtendedOptionalListResponseBuilder {
    user_optional_list_page_fields: Option<UserOptionalListPage>,
    total_count: Option<i64>,
}

impl ListUsersExtendedOptionalListResponseBuilder {
    pub fn user_optional_list_page_fields(mut self, value: UserOptionalListPage) -> Self {
        self.user_optional_list_page_fields = Some(value);
        self
    }

    pub fn total_count(mut self, value: i64) -> Self {
        self.total_count = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersExtendedOptionalListResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_optional_list_page_fields`](ListUsersExtendedOptionalListResponseBuilder::user_optional_list_page_fields)
    /// - [`total_count`](ListUsersExtendedOptionalListResponseBuilder::total_count)
    pub fn build(self) -> Result<ListUsersExtendedOptionalListResponse, BuildError> {
        Ok(ListUsersExtendedOptionalListResponse {
            user_optional_list_page_fields: self.user_optional_list_page_fields.ok_or_else(|| BuildError::missing_field("user_optional_list_page_fields"))?,
            total_count: self.total_count.ok_or_else(|| BuildError::missing_field("total_count"))?,
        })
    }
}
