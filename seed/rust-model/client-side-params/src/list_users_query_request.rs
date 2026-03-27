pub use crate::prelude::*;

/// Query parameters for listUsers
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersQueryRequest {
    /// Page index of the results to return. First page is 0.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    /// Number of results per page.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<i64>,
    /// Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_totals: Option<bool>,
    /// Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sort: Option<String>,
    /// Connection filter
    #[serde(skip_serializing_if = "Option::is_none")]
    pub connection: Option<String>,
    /// Query string following Lucene query string syntax
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q: Option<String>,
    /// Search engine version (v1, v2, or v3)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub search_engine: Option<String>,
    /// Comma-separated list of fields to include or exclude
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
}

impl ListUsersQueryRequest {
    pub fn builder() -> ListUsersQueryRequestBuilder {
        <ListUsersQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersQueryRequestBuilder {
    page: Option<i64>,
    per_page: Option<i64>,
    include_totals: Option<bool>,
    sort: Option<String>,
    connection: Option<String>,
    q: Option<String>,
    search_engine: Option<String>,
    fields: Option<String>,
}

impl ListUsersQueryRequestBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    pub fn per_page(mut self, value: i64) -> Self {
        self.per_page = Some(value);
        self
    }

    pub fn include_totals(mut self, value: bool) -> Self {
        self.include_totals = Some(value);
        self
    }

    pub fn sort(mut self, value: impl Into<String>) -> Self {
        self.sort = Some(value.into());
        self
    }

    pub fn connection(mut self, value: impl Into<String>) -> Self {
        self.connection = Some(value.into());
        self
    }

    pub fn q(mut self, value: impl Into<String>) -> Self {
        self.q = Some(value.into());
        self
    }

    pub fn search_engine(mut self, value: impl Into<String>) -> Self {
        self.search_engine = Some(value.into());
        self
    }

    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListUsersQueryRequest`].
    pub fn build(self) -> Result<ListUsersQueryRequest, BuildError> {
        Ok(ListUsersQueryRequest {
            page: self.page,
            per_page: self.per_page,
            include_totals: self.include_totals,
            sort: self.sort,
            connection: self.connection,
            q: self.q,
            search_engine: self.search_engine,
            fields: self.fields,
        })
    }
}

