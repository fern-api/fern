pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersExtendedResponse2 {
    #[serde(flatten)]
    pub user_page_fields: UserPage2,
    /// The totall number of /users
    #[serde(default)]
    pub total_count: i64,
}

impl ListUsersExtendedResponse2 {
    pub fn builder() -> ListUsersExtendedResponse2Builder {
        <ListUsersExtendedResponse2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersExtendedResponse2Builder {
    user_page_fields: Option<UserPage2>,
    total_count: Option<i64>,
}

impl ListUsersExtendedResponse2Builder {
    pub fn user_page_fields(mut self, value: UserPage2) -> Self {
        self.user_page_fields = Some(value);
        self
    }

    pub fn total_count(mut self, value: i64) -> Self {
        self.total_count = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersExtendedResponse2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_page_fields`](ListUsersExtendedResponse2Builder::user_page_fields)
    /// - [`total_count`](ListUsersExtendedResponse2Builder::total_count)
    pub fn build(self) -> Result<ListUsersExtendedResponse2, BuildError> {
        Ok(ListUsersExtendedResponse2 {
            user_page_fields: self
                .user_page_fields
                .ok_or_else(|| BuildError::missing_field("user_page_fields"))?,
            total_count: self
                .total_count
                .ok_or_else(|| BuildError::missing_field("total_count"))?,
        })
    }
}
