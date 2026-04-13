pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListWithBodyOffsetPaginationRequest {
    /// The object that contains the offset used for pagination
    /// in order to fetch the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<WithPage>,
}

impl UsersListWithBodyOffsetPaginationRequest {
    pub fn builder() -> UsersListWithBodyOffsetPaginationRequestBuilder {
        <UsersListWithBodyOffsetPaginationRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersListWithBodyOffsetPaginationRequestBuilder {
    pagination: Option<WithPage>,
}

impl UsersListWithBodyOffsetPaginationRequestBuilder {
    pub fn pagination(mut self, value: WithPage) -> Self {
        self.pagination = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsersListWithBodyOffsetPaginationRequest`].
    pub fn build(self) -> Result<UsersListWithBodyOffsetPaginationRequest, BuildError> {
        Ok(UsersListWithBodyOffsetPaginationRequest {
            pagination: self.pagination,
        })
    }
}

