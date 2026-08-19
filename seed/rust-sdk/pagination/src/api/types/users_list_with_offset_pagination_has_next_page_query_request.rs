pub use crate::prelude::*;

/// Query parameters for listWithOffsetPaginationHasNextPage
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListWithOffsetPaginationHasNextPageQueryRequest {
    /// Defaults to first page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    /// The maximum number of elements to return.
    /// This is also used as the step size in this
    /// paginated endpoint.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<Order2>,
}

impl UsersListWithOffsetPaginationHasNextPageQueryRequest {
    pub fn builder() -> UsersListWithOffsetPaginationHasNextPageQueryRequestBuilder {
        <UsersListWithOffsetPaginationHasNextPageQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersListWithOffsetPaginationHasNextPageQueryRequestBuilder {
    page: Option<i64>,
    limit: Option<i64>,
    order: Option<Order2>,
}

impl UsersListWithOffsetPaginationHasNextPageQueryRequestBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn order(mut self, value: Order2) -> Self {
        self.order = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsersListWithOffsetPaginationHasNextPageQueryRequest`].
    pub fn build(self) -> Result<UsersListWithOffsetPaginationHasNextPageQueryRequest, BuildError> {
        Ok(UsersListWithOffsetPaginationHasNextPageQueryRequest {
            page: self.page,
            limit: self.limit,
            order: self.order,
        })
    }
}
