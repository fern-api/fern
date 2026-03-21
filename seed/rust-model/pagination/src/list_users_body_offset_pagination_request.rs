pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersBodyOffsetPaginationRequest {
    /// The object that contains the offset used for pagination
    /// in order to fetch the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<WithPage>,
}

impl ListUsersBodyOffsetPaginationRequest {
    pub fn builder() -> ListUsersBodyOffsetPaginationRequestBuilder {
        ListUsersBodyOffsetPaginationRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersBodyOffsetPaginationRequestBuilder {
    pagination: Option<WithPage>,
}

impl ListUsersBodyOffsetPaginationRequestBuilder {
    pub fn pagination(mut self, value: WithPage) -> Self {
        self.pagination = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersBodyOffsetPaginationRequest`].
    pub fn build(self) -> Result<ListUsersBodyOffsetPaginationRequest, BuildError> {
        Ok(ListUsersBodyOffsetPaginationRequest {
            pagination: self.pagination,
        })
    }
}

