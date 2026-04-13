pub use crate::prelude::*;

/// Query parameters for filterbyrole
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FilterbyroleQueryRequest {
    pub role: UserRole,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<UserStatus>,
    #[serde(rename = "secondaryRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub secondary_role: Option<UserRole>,
}

impl FilterbyroleQueryRequest {
    pub fn builder() -> FilterbyroleQueryRequestBuilder {
        <FilterbyroleQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FilterbyroleQueryRequestBuilder {
    role: Option<UserRole>,
    status: Option<UserStatus>,
    secondary_role: Option<UserRole>,
}

impl FilterbyroleQueryRequestBuilder {
    pub fn role(mut self, value: UserRole) -> Self {
        self.role = Some(value);
        self
    }

    pub fn status(mut self, value: UserStatus) -> Self {
        self.status = Some(value);
        self
    }

    pub fn secondary_role(mut self, value: UserRole) -> Self {
        self.secondary_role = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FilterbyroleQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`role`](FilterbyroleQueryRequestBuilder::role)
    pub fn build(self) -> Result<FilterbyroleQueryRequest, BuildError> {
        Ok(FilterbyroleQueryRequest {
            role: self.role.ok_or_else(|| BuildError::missing_field("role"))?,
            status: self.status,
            secondary_role: self.secondary_role,
        })
    }
}
