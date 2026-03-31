pub use crate::prelude::*;

/// Query parameters for listWithDoubleOffsetPagination
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct UsersListWithDoubleOffsetPaginationQueryRequest {
    /// Defaults to first page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<f64>,
    /// Defaults to per page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<Order2>,
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl UsersListWithDoubleOffsetPaginationQueryRequest {
    pub fn builder() -> UsersListWithDoubleOffsetPaginationQueryRequestBuilder {
        <UsersListWithDoubleOffsetPaginationQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersListWithDoubleOffsetPaginationQueryRequestBuilder {
    page: Option<f64>,
    per_page: Option<f64>,
    order: Option<Order2>,
    starting_after: Option<String>,
}

impl UsersListWithDoubleOffsetPaginationQueryRequestBuilder {
    pub fn page(mut self, value: f64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn per_page(mut self, value: f64) -> Self {
        self.per_page = Some(value);
        self
    }

    pub fn order(mut self, value: Order2) -> Self {
        self.order = Some(value);
        self
    }

    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UsersListWithDoubleOffsetPaginationQueryRequest`].
    pub fn build(self) -> Result<UsersListWithDoubleOffsetPaginationQueryRequest, BuildError> {
        Ok(UsersListWithDoubleOffsetPaginationQueryRequest {
            page: self.page,
            per_page: self.per_page,
            order: self.order,
            starting_after: self.starting_after,
        })
    }
}
