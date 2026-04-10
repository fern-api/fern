pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateUsernameBody {
    #[serde(default)]
    pub username: String,
    #[serde(default)]
    pub password: String,
    #[serde(default)]
    pub name: String,
}

impl CreateUsernameBody {
    pub fn builder() -> CreateUsernameBodyBuilder {
        <CreateUsernameBodyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateUsernameBodyBuilder {
    username: Option<String>,
    password: Option<String>,
    name: Option<String>,
}

impl CreateUsernameBodyBuilder {
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

    /// Consumes the builder and constructs a [`CreateUsernameBody`].
    /// This method will fail if any of the following fields are not set:
    /// - [`username`](CreateUsernameBodyBuilder::username)
    /// - [`password`](CreateUsernameBodyBuilder::password)
    /// - [`name`](CreateUsernameBodyBuilder::name)
    pub fn build(self) -> Result<CreateUsernameBody, BuildError> {
        Ok(CreateUsernameBody {
            username: self.username.ok_or_else(|| BuildError::missing_field("username"))?,
            password: self.password.ok_or_else(|| BuildError::missing_field("password"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
