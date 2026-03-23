pub use crate::prelude::*;

/// For testing PATCH operations
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UpdateUserRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub address: Option<Address>,
}

impl UpdateUserRequest {
    pub fn builder() -> UpdateUserRequestBuilder {
        UpdateUserRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UpdateUserRequestBuilder {
    username: Option<String>,
    email: Option<String>,
    phone: Option<String>,
    address: Option<Address>,
}

impl UpdateUserRequestBuilder {
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

    pub fn address(mut self, value: Address) -> Self {
        self.address = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UpdateUserRequest`].
    pub fn build(self) -> Result<UpdateUserRequest, BuildError> {
        Ok(UpdateUserRequest {
            username: self.username,
            email: self.email,
            phone: self.phone,
            address: self.address,
        })
    }
}
