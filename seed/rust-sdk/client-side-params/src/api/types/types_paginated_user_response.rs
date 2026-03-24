pub use crate::prelude::*;

/// Response with pagination info like Auth0
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PaginatedUserResponse {
    #[serde(default)]
    pub users: Vec<User>,
    #[serde(default)]
    pub start: i64,
    #[serde(default)]
    pub limit: i64,
    #[serde(default)]
    pub length: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<i64>,
}

impl PaginatedUserResponse {
    pub fn builder() -> PaginatedUserResponseBuilder {
        PaginatedUserResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PaginatedUserResponseBuilder {
    users: Option<Vec<User>>,
    start: Option<i64>,
    limit: Option<i64>,
    length: Option<i64>,
    total: Option<i64>,
}

impl PaginatedUserResponseBuilder {
    pub fn users(mut self, value: Vec<User>) -> Self {
        self.users = Some(value);
        self
    }

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

    /// Consumes the builder and constructs a [`PaginatedUserResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`users`](PaginatedUserResponseBuilder::users)
    /// - [`start`](PaginatedUserResponseBuilder::start)
    /// - [`limit`](PaginatedUserResponseBuilder::limit)
    /// - [`length`](PaginatedUserResponseBuilder::length)
    pub fn build(self) -> Result<PaginatedUserResponse, BuildError> {
        Ok(PaginatedUserResponse {
            users: self
                .users
                .ok_or_else(|| BuildError::missing_field("users"))?,
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
        })
    }
}
