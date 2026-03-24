pub use crate::prelude::*;

/// Query parameters for listResources
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListResourcesQueryRequest {
    #[serde(default)]
    pub page_limit: i64,
    #[serde(rename = "beforeDate")]
    #[serde(default)]
    pub before_date: NaiveDate,
}

impl ListResourcesQueryRequest {
    pub fn builder() -> ListResourcesQueryRequestBuilder {
        ListResourcesQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListResourcesQueryRequestBuilder {
    page_limit: Option<i64>,
    before_date: Option<NaiveDate>,
}

impl ListResourcesQueryRequestBuilder {
    pub fn page_limit(mut self, value: i64) -> Self {
        self.page_limit = Some(value);
        self
    }

    pub fn before_date(mut self, value: NaiveDate) -> Self {
        self.before_date = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListResourcesQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`page_limit`](ListResourcesQueryRequestBuilder::page_limit)
    /// - [`before_date`](ListResourcesQueryRequestBuilder::before_date)
    pub fn build(self) -> Result<ListResourcesQueryRequest, BuildError> {
        Ok(ListResourcesQueryRequest {
            page_limit: self
                .page_limit
                .ok_or_else(|| BuildError::missing_field("page_limit"))?,
            before_date: self
                .before_date
                .ok_or_else(|| BuildError::missing_field("before_date"))?,
        })
    }
}
