pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersBodyOffsetPaginationRequest2 {
    /// The object that contains the offset used for pagination
    /// in order to fetch the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<WithPage2>,
}

impl ListUsersBodyOffsetPaginationRequest2 {
    pub fn builder() -> ListUsersBodyOffsetPaginationRequest2Builder {
        <ListUsersBodyOffsetPaginationRequest2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersBodyOffsetPaginationRequest2Builder {
    pagination: Option<WithPage2>,
}

impl ListUsersBodyOffsetPaginationRequest2Builder {
    pub fn pagination(mut self, value: WithPage2) -> Self {
        self.pagination = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersBodyOffsetPaginationRequest2`].
    pub fn build(self) -> Result<ListUsersBodyOffsetPaginationRequest2, BuildError> {
        Ok(ListUsersBodyOffsetPaginationRequest2 {
            pagination: self.pagination,
        })
    }
}

