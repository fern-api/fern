pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersExtendedOptionalListResponse2 {
    #[serde(flatten)]
    pub user_optional_list_page_fields: UserOptionalListPage2,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
}

impl ListUsersExtendedOptionalListResponse2 {
    pub fn builder() -> ListUsersExtendedOptionalListResponse2Builder {
        <ListUsersExtendedOptionalListResponse2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersExtendedOptionalListResponse2Builder {
    user_optional_list_page_fields: Option<UserOptionalListPage2>,
    total_count: Option<i64>,
}

impl ListUsersExtendedOptionalListResponse2Builder {
    pub fn user_optional_list_page_fields(mut self, value: UserOptionalListPage2) -> Self {
        self.user_optional_list_page_fields = Some(value);
        self
    }

    pub fn total_count(mut self, value: i64) -> Self {
        self.total_count = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersExtendedOptionalListResponse2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_optional_list_page_fields`](ListUsersExtendedOptionalListResponse2Builder::user_optional_list_page_fields)
    /// - [`total_count`](ListUsersExtendedOptionalListResponse2Builder::total_count)
    pub fn build(self) -> Result<ListUsersExtendedOptionalListResponse2, BuildError> {
        Ok(ListUsersExtendedOptionalListResponse2 {
            user_optional_list_page_fields: self
                .user_optional_list_page_fields
                .ok_or_else(|| BuildError::missing_field("user_optional_list_page_fields"))?,
            total_count: self
                .total_count
                .ok_or_else(|| BuildError::missing_field("total_count"))?,
        })
    }
}
