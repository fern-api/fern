pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateUserRequest {
    #[serde(default)]
    pub username: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub address: Option<Address>,
}

impl CreateUserRequest {
    pub fn builder() -> CreateUserRequestBuilder {
        <CreateUserRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateUserRequestBuilder {
    username: Option<String>,
    email: Option<String>,
    phone: Option<String>,
    address: Option<Address>,
}

impl CreateUserRequestBuilder {
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

    /// Consumes the builder and constructs a [`CreateUserRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`username`](CreateUserRequestBuilder::username)
    pub fn build(self) -> Result<CreateUserRequest, BuildError> {
        Ok(CreateUserRequest {
            username: self.username.ok_or_else(|| BuildError::missing_field("username"))?,
            email: self.email,
            phone: self.phone,
            address: self.address,
        })
    }
}
