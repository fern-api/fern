pub use crate::prelude::*;

/// Query parameters for filterByRole
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FilterByRoleQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<UserRole>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<UserStatus>,
    #[serde(rename = "secondaryRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub secondary_role: Option<UserRole>,
}

impl FilterByRoleQueryRequest {
    pub fn builder() -> FilterByRoleQueryRequestBuilder {
        <FilterByRoleQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FilterByRoleQueryRequestBuilder {
    role: Option<UserRole>,
    status: Option<UserStatus>,
    secondary_role: Option<UserRole>,
}

impl FilterByRoleQueryRequestBuilder {
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

    /// Consumes the builder and constructs a [`FilterByRoleQueryRequest`].
    pub fn build(self) -> Result<FilterByRoleQueryRequest, BuildError> {
        Ok(FilterByRoleQueryRequest {
            role: self.role,
            status: self.status,
            secondary_role: self.secondary_role,
        })
    }
}

