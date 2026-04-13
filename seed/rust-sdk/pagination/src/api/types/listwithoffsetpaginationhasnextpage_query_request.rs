pub use crate::prelude::*;

/// Query parameters for listwithoffsetpaginationhasnextpage
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListwithoffsetpaginationhasnextpageQueryRequest {
    /// Defaults to first page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    /// The maximum number of elements to return.
    /// This is also used as the step size in this
    /// paginated endpoint.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<Order>,
}

impl ListwithoffsetpaginationhasnextpageQueryRequest {
    pub fn builder() -> ListwithoffsetpaginationhasnextpageQueryRequestBuilder {
        <ListwithoffsetpaginationhasnextpageQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListwithoffsetpaginationhasnextpageQueryRequestBuilder {
    page: Option<i64>,
    limit: Option<i64>,
    order: Option<Order>,
}

impl ListwithoffsetpaginationhasnextpageQueryRequestBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn order(mut self, value: Order) -> Self {
        self.order = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListwithoffsetpaginationhasnextpageQueryRequest`].
    pub fn build(self) -> Result<ListwithoffsetpaginationhasnextpageQueryRequest, BuildError> {
        Ok(ListwithoffsetpaginationhasnextpageQueryRequest {
            page: self.page,
            limit: self.limit,
            order: self.order,
        })
    }
}
