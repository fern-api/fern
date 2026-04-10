pub use crate::prelude::*;

/// Query parameters for listresources
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListresourcesQueryRequest {
    #[serde(default)]
    pub page_limit: i64,
    #[serde(rename = "beforeDate")]
    #[serde(default)]
    pub before_date: NaiveDate,
}

impl ListresourcesQueryRequest {
    pub fn builder() -> ListresourcesQueryRequestBuilder {
        <ListresourcesQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListresourcesQueryRequestBuilder {
    page_limit: Option<i64>,
    before_date: Option<NaiveDate>,
}

impl ListresourcesQueryRequestBuilder {
    pub fn page_limit(mut self, value: i64) -> Self {
        self.page_limit = Some(value);
        self
    }

    pub fn before_date(mut self, value: NaiveDate) -> Self {
        self.before_date = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListresourcesQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`page_limit`](ListresourcesQueryRequestBuilder::page_limit)
    /// - [`before_date`](ListresourcesQueryRequestBuilder::before_date)
    pub fn build(self) -> Result<ListresourcesQueryRequest, BuildError> {
        Ok(ListresourcesQueryRequest {
            page_limit: self.page_limit.ok_or_else(|| BuildError::missing_field("page_limit"))?,
            before_date: self.before_date.ok_or_else(|| BuildError::missing_field("before_date"))?,
        })
    }
}

