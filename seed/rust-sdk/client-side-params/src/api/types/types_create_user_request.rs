pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct CreateUserRequest {
    #[serde(default)]
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email_verified: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone_number: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone_verified: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_metadata: Option<HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_metadata: Option<HashMap<String, serde_json::Value>>,
    #[serde(default)]
    pub connection: String,
}

impl CreateUserRequest {
    pub fn builder() -> CreateUserRequestBuilder {
        CreateUserRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateUserRequestBuilder {
    email: Option<String>,
    email_verified: Option<bool>,
    username: Option<String>,
    password: Option<String>,
    phone_number: Option<String>,
    phone_verified: Option<bool>,
    user_metadata: Option<HashMap<String, serde_json::Value>>,
    app_metadata: Option<HashMap<String, serde_json::Value>>,
    connection: Option<String>,
}

impl CreateUserRequestBuilder {
    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    pub fn email_verified(mut self, value: bool) -> Self {
        self.email_verified = Some(value);
        self
    }

    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
        self
    }

    pub fn password(mut self, value: impl Into<String>) -> Self {
        self.password = Some(value.into());
        self
    }

    pub fn phone_number(mut self, value: impl Into<String>) -> Self {
        self.phone_number = Some(value.into());
        self
    }

    pub fn phone_verified(mut self, value: bool) -> Self {
        self.phone_verified = Some(value);
        self
    }

    pub fn user_metadata(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.user_metadata = Some(value);
        self
    }

    pub fn app_metadata(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.app_metadata = Some(value);
        self
    }

    pub fn connection(mut self, value: impl Into<String>) -> Self {
        self.connection = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreateUserRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`email`](CreateUserRequestBuilder::email)
    /// - [`connection`](CreateUserRequestBuilder::connection)
    pub fn build(self) -> Result<CreateUserRequest, BuildError> {
        Ok(CreateUserRequest {
            email: self
                .email
                .ok_or_else(|| BuildError::missing_field("email"))?,
            email_verified: self.email_verified,
            username: self.username,
            password: self.password,
            phone_number: self.phone_number,
            phone_verified: self.phone_verified,
            user_metadata: self.user_metadata,
            app_metadata: self.app_metadata,
            connection: self
                .connection
                .ok_or_else(|| BuildError::missing_field("connection"))?,
        })
    }
}
