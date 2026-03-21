pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct UpdateUserRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email_verified: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone_number: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone_verified: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_metadata: Option<HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_metadata: Option<HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blocked: Option<bool>,
}

impl UpdateUserRequest {
    pub fn builder() -> UpdateUserRequestBuilder {
        UpdateUserRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UpdateUserRequestBuilder {
    email: Option<String>,
    email_verified: Option<bool>,
    username: Option<String>,
    phone_number: Option<String>,
    phone_verified: Option<bool>,
    user_metadata: Option<HashMap<String, serde_json::Value>>,
    app_metadata: Option<HashMap<String, serde_json::Value>>,
    password: Option<String>,
    blocked: Option<bool>,
}

impl UpdateUserRequestBuilder {
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

    pub fn password(mut self, value: impl Into<String>) -> Self {
        self.password = Some(value.into());
        self
    }

    pub fn blocked(mut self, value: bool) -> Self {
        self.blocked = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UpdateUserRequest`].
    pub fn build(self) -> Result<UpdateUserRequest, BuildError> {
        Ok(UpdateUserRequest {
            email: self.email,
            email_verified: self.email_verified,
            username: self.username,
            phone_number: self.phone_number,
            phone_verified: self.phone_verified,
            user_metadata: self.user_metadata,
            app_metadata: self.app_metadata,
            password: self.password,
            blocked: self.blocked,
        })
    }
}
