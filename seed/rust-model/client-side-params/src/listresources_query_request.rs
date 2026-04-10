pub use crate::prelude::*;

/// Query parameters for listresources
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListresourcesQueryRequest {
    /// Zero-indexed page number
    #[serde(default)]
    pub page: i64,
    /// Number of items per page
    #[serde(default)]
    pub per_page: i64,
    /// Sort field
    #[serde(default)]
    pub sort: String,
    /// Sort order (asc or desc)
    #[serde(default)]
    pub order: String,
    /// Whether to include total count
    #[serde(default)]
    pub include_totals: bool,
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    /// Search query
    #[serde(skip_serializing_if = "Option::is_none")]
    pub search: Option<String>,
}

impl ListresourcesQueryRequest {
    pub fn builder() -> ListresourcesQueryRequestBuilder {
        <ListresourcesQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListresourcesQueryRequestBuilder {
    page: Option<i64>,
    per_page: Option<i64>,
    sort: Option<String>,
    order: Option<String>,
    include_totals: Option<bool>,
    fields: Option<String>,
    search: Option<String>,
}

impl ListresourcesQueryRequestBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn per_page(mut self, value: i64) -> Self {
        self.per_page = Some(value);
        self
    }

    pub fn sort(mut self, value: impl Into<String>) -> Self {
        self.sort = Some(value.into());
        self
    }

    pub fn order(mut self, value: impl Into<String>) -> Self {
        self.order = Some(value.into());
        self
    }

    pub fn include_totals(mut self, value: bool) -> Self {
        self.include_totals = Some(value);
        self
    }

    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    pub fn search(mut self, value: impl Into<String>) -> Self {
        self.search = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListresourcesQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`page`](ListresourcesQueryRequestBuilder::page)
    /// - [`per_page`](ListresourcesQueryRequestBuilder::per_page)
    /// - [`sort`](ListresourcesQueryRequestBuilder::sort)
    /// - [`order`](ListresourcesQueryRequestBuilder::order)
    /// - [`include_totals`](ListresourcesQueryRequestBuilder::include_totals)
    pub fn build(self) -> Result<ListresourcesQueryRequest, BuildError> {
        Ok(ListresourcesQueryRequest {
            page: self.page.ok_or_else(|| BuildError::missing_field("page"))?,
            per_page: self.per_page.ok_or_else(|| BuildError::missing_field("per_page"))?,
            sort: self.sort.ok_or_else(|| BuildError::missing_field("sort"))?,
            order: self.order.ok_or_else(|| BuildError::missing_field("order"))?,
            include_totals: self.include_totals.ok_or_else(|| BuildError::missing_field("include_totals"))?,
            fields: self.fields,
            search: self.search,
        })
    }
}

