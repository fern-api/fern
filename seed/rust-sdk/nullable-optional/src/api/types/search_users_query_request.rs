pub use crate::prelude::*;

/// Query parameters for searchUsers
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SearchUsersQueryRequest {
    #[serde(default)]
    pub query: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub department: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    #[serde(rename = "isActive")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_active: Option<bool>,
}

impl SearchUsersQueryRequest {
    pub fn builder() -> SearchUsersQueryRequestBuilder {
        SearchUsersQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SearchUsersQueryRequestBuilder {
    query: Option<String>,
    department: Option<String>,
    role: Option<String>,
    is_active: Option<bool>,
}

impl SearchUsersQueryRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn department(mut self, value: impl Into<String>) -> Self {
        self.department = Some(value.into());
        self
    }

    pub fn role(mut self, value: impl Into<String>) -> Self {
        self.role = Some(value.into());
        self
    }

    pub fn is_active(mut self, value: bool) -> Self {
        self.is_active = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SearchUsersQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](SearchUsersQueryRequestBuilder::query)
    pub fn build(self) -> Result<SearchUsersQueryRequest, BuildError> {
        Ok(SearchUsersQueryRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
            department: self.department,
            role: self.role,
            is_active: self.is_active,
        })
    }
}
