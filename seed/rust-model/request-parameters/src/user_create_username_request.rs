pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserCreateUsernameRequest {
    #[serde(default)]
    pub username: String,
    #[serde(default)]
    pub password: String,
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing)]
    #[serde(default)]
    pub tags: Vec<Option<String>>,
}

impl UserCreateUsernameRequest {
    pub fn builder() -> UserCreateUsernameRequestBuilder {
        <UserCreateUsernameRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserCreateUsernameRequestBuilder {
    username: Option<String>,
    password: Option<String>,
    name: Option<String>,
    tags: Option<Vec<Option<String>>>,
}

impl UserCreateUsernameRequestBuilder {
    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
        self
    }

    pub fn password(mut self, value: impl Into<String>) -> Self {
        self.password = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn tags(mut self, value: Vec<Option<String>>) -> Self {
        self.tags = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserCreateUsernameRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`username`](UserCreateUsernameRequestBuilder::username)
    /// - [`password`](UserCreateUsernameRequestBuilder::password)
    /// - [`name`](UserCreateUsernameRequestBuilder::name)
    /// - [`tags`](UserCreateUsernameRequestBuilder::tags)
    pub fn build(self) -> Result<UserCreateUsernameRequest, BuildError> {
        Ok(UserCreateUsernameRequest {
            username: self.username.ok_or_else(|| BuildError::missing_field("username"))?,
            password: self.password.ok_or_else(|| BuildError::missing_field("password"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            tags: self.tags.ok_or_else(|| BuildError::missing_field("tags"))?,
        })
    }
}

