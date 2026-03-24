pub use crate::prelude::*;

/// Query parameters for listClients
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListClientsQueryRequest {
    /// Comma-separated list of fields to include
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<String>,
    /// Whether specified fields are included or excluded
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_fields: Option<bool>,
    /// Page number (zero-based)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    /// Number of results per page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<i64>,
    /// Include total count in response
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_totals: Option<bool>,
    /// Filter by global clients
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_global: Option<bool>,
    /// Filter by first party clients
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_first_party: Option<bool>,
    /// Filter by application type (spa, native, regular_web, non_interactive)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_type: Option<Vec<String>>,
}

impl ListClientsQueryRequest {
    pub fn builder() -> ListClientsQueryRequestBuilder {
        ListClientsQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListClientsQueryRequestBuilder {
    fields: Option<String>,
    include_fields: Option<bool>,
    page: Option<i64>,
    per_page: Option<i64>,
    include_totals: Option<bool>,
    is_global: Option<bool>,
    is_first_party: Option<bool>,
    app_type: Option<Vec<String>>,
}

impl ListClientsQueryRequestBuilder {
    pub fn fields(mut self, value: impl Into<String>) -> Self {
        self.fields = Some(value.into());
        self
    }

    pub fn include_fields(mut self, value: bool) -> Self {
        self.include_fields = Some(value);
        self
    }

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

    pub fn is_global(mut self, value: bool) -> Self {
        self.is_global = Some(value);
        self
    }

    pub fn is_first_party(mut self, value: bool) -> Self {
        self.is_first_party = Some(value);
        self
    }

    pub fn app_type(mut self, value: Vec<String>) -> Self {
        self.app_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListClientsQueryRequest`].
    pub fn build(self) -> Result<ListClientsQueryRequest, BuildError> {
        Ok(ListClientsQueryRequest {
            fields: self.fields,
            include_fields: self.include_fields,
            page: self.page,
            per_page: self.per_page,
            include_totals: self.include_totals,
            is_global: self.is_global,
            is_first_party: self.is_first_party,
            app_type: self.app_type,
        })
    }
}
