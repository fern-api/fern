pub use crate::prelude::*;

/// Query parameters for listWithCustomPager
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListWithCustomPagerQueryRequest {
    /// The maximum number of results to return.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    /// The cursor used for pagination.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl ListWithCustomPagerQueryRequest {
    pub fn builder() -> ListWithCustomPagerQueryRequestBuilder {
        <ListWithCustomPagerQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListWithCustomPagerQueryRequestBuilder {
    limit: Option<i64>,
    starting_after: Option<String>,
}

impl ListWithCustomPagerQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListWithCustomPagerQueryRequest`].
    pub fn build(self) -> Result<ListWithCustomPagerQueryRequest, BuildError> {
        Ok(ListWithCustomPagerQueryRequest {
            limit: self.limit,
            starting_after: self.starting_after,
        })
    }
}
