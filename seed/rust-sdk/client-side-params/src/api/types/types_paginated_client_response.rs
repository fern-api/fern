pub use crate::prelude::*;

/// Paginated response for clients listing
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PaginatedClientResponse {
    /// Starting index (zero-based)
    #[serde(default)]
    pub start: i64,
    /// Number of items requested
    #[serde(default)]
    pub limit: i64,
    /// Number of items returned
    #[serde(default)]
    pub length: i64,
    /// Total number of items (when include_totals=true)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<i64>,
    /// List of clients
    #[serde(default)]
    pub clients: Vec<Client>,
}

impl PaginatedClientResponse {
    pub fn builder() -> PaginatedClientResponseBuilder {
        PaginatedClientResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PaginatedClientResponseBuilder {
    start: Option<i64>,
    limit: Option<i64>,
    length: Option<i64>,
    total: Option<i64>,
    clients: Option<Vec<Client>>,
}

impl PaginatedClientResponseBuilder {
    pub fn start(mut self, value: i64) -> Self {
        self.start = Some(value);
        self
    }

    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn length(mut self, value: i64) -> Self {
        self.length = Some(value);
        self
    }

    pub fn total(mut self, value: i64) -> Self {
        self.total = Some(value);
        self
    }

    pub fn clients(mut self, value: Vec<Client>) -> Self {
        self.clients = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PaginatedClientResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`start`](PaginatedClientResponseBuilder::start)
    /// - [`limit`](PaginatedClientResponseBuilder::limit)
    /// - [`length`](PaginatedClientResponseBuilder::length)
    /// - [`clients`](PaginatedClientResponseBuilder::clients)
    pub fn build(self) -> Result<PaginatedClientResponse, BuildError> {
        Ok(PaginatedClientResponse {
            start: self
                .start
                .ok_or_else(|| BuildError::missing_field("start"))?,
            limit: self
                .limit
                .ok_or_else(|| BuildError::missing_field("limit"))?,
            length: self
                .length
                .ok_or_else(|| BuildError::missing_field("length"))?,
            total: self.total,
            clients: self
                .clients
                .ok_or_else(|| BuildError::missing_field("clients"))?,
        })
    }
}
