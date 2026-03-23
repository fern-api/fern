pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserResponse {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub username: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone: Option<String>,
    #[serde(rename = "createdAt")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub created_at: DateTime<FixedOffset>,
    #[serde(rename = "updatedAt")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub updated_at: Option<DateTime<FixedOffset>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub address: Option<Address>,
}

impl UserResponse {
    pub fn builder() -> UserResponseBuilder {
        UserResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserResponseBuilder {
    id: Option<String>,
    username: Option<String>,
    email: Option<String>,
    phone: Option<String>,
    created_at: Option<DateTime<FixedOffset>>,
    updated_at: Option<DateTime<FixedOffset>>,
    address: Option<Address>,
}

impl UserResponseBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
        self
    }

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    pub fn phone(mut self, value: impl Into<String>) -> Self {
        self.phone = Some(value.into());
        self
    }

    pub fn created_at(mut self, value: DateTime<FixedOffset>) -> Self {
        self.created_at = Some(value);
        self
    }

    pub fn updated_at(mut self, value: DateTime<FixedOffset>) -> Self {
        self.updated_at = Some(value);
        self
    }

    pub fn address(mut self, value: Address) -> Self {
        self.address = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](UserResponseBuilder::id)
    /// - [`username`](UserResponseBuilder::username)
    /// - [`created_at`](UserResponseBuilder::created_at)
    pub fn build(self) -> Result<UserResponse, BuildError> {
        Ok(UserResponse {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            username: self.username.ok_or_else(|| BuildError::missing_field("username"))?,
            email: self.email,
            phone: self.phone,
            created_at: self.created_at.ok_or_else(|| BuildError::missing_field("created_at"))?,
            updated_at: self.updated_at,
            address: self.address,
        })
    }
}
