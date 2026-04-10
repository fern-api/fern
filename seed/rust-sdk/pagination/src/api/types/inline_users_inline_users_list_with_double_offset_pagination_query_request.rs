pub use crate::prelude::*;

/// Query parameters for listWithDoubleOffsetPagination
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest {
    /// Defaults to first page
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers::option")]
    pub page: Option<f64>,
    /// Defaults to per page
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers::option")]
    pub per_page: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<Order>,
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest {
    pub fn builder() -> InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequestBuilder {
        <InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequestBuilder {
    page: Option<f64>,
    per_page: Option<f64>,
    order: Option<Order>,
    starting_after: Option<String>,
}

impl InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequestBuilder {
    pub fn page(mut self, value: f64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn per_page(mut self, value: f64) -> Self {
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

    /// Consumes the builder and constructs a [`InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest`].
    pub fn build(
        self,
    ) -> Result<InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest, BuildError> {
        Ok(
            InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest {
                page: self.page,
                per_page: self.per_page,
                order: self.order,
                starting_after: self.starting_after,
            },
        )
    }
}
