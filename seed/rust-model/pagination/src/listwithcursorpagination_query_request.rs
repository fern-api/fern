pub use crate::prelude::*;

/// Query parameters for listwithcursorpagination
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListwithcursorpaginationQueryRequest {
    /// Defaults to first page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    /// Defaults to per page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<Order>,
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl ListwithcursorpaginationQueryRequest {
    pub fn builder() -> ListwithcursorpaginationQueryRequestBuilder {
        <ListwithcursorpaginationQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListwithcursorpaginationQueryRequestBuilder {
    page: Option<i64>,
    per_page: Option<i64>,
    order: Option<Order>,
    starting_after: Option<String>,
}

impl ListwithcursorpaginationQueryRequestBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn per_page(mut self, value: i64) -> Self {
        self.per_page = Some(value);
        self
    }

    pub fn order(mut self, value: Order) -> Self {
        self.order = Some(value);
        self
    }

    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListwithcursorpaginationQueryRequest`].
    pub fn build(self) -> Result<ListwithcursorpaginationQueryRequest, BuildError> {
        Ok(ListwithcursorpaginationQueryRequest {
            page: self.page,
            per_page: self.per_page,
            order: self.order,
            starting_after: self.starting_after,
        })
    }
}

