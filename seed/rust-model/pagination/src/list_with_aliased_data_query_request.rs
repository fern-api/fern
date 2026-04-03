pub use crate::prelude::*;

/// Query parameters for listWithAliasedData
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListWithAliasedDataQueryRequest {
    /// Defaults to first page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    /// Defaults to per page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<i64>,
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl ListWithAliasedDataQueryRequest {
    pub fn builder() -> ListWithAliasedDataQueryRequestBuilder {
        <ListWithAliasedDataQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListWithAliasedDataQueryRequestBuilder {
    page: Option<i64>,
    per_page: Option<i64>,
    starting_after: Option<String>,
}

impl ListWithAliasedDataQueryRequestBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn per_page(mut self, value: i64) -> Self {
        self.per_page = Some(value);
        self
    }

    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListWithAliasedDataQueryRequest`].
    pub fn build(self) -> Result<ListWithAliasedDataQueryRequest, BuildError> {
        Ok(ListWithAliasedDataQueryRequest {
            page: self.page,
            per_page: self.per_page,
            starting_after: self.starting_after,
        })
    }
}

