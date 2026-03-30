pub use crate::prelude::*;

/// User object
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct User {
    /// The unique identifier for the user.
    #[serde(default)]
    pub id: String,
    /// The email address of the user.
    #[serde(default)]
    pub email: String,
    /// The password for the user.
    #[serde(default)]
    pub password: String,
    /// User profile object
    #[serde(default)]
    pub profile: UserProfile,
}

impl User {
    pub fn builder() -> UserBuilder {
        <UserBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserBuilder {
    id: Option<String>,
    email: Option<String>,
    password: Option<String>,
    profile: Option<UserProfile>,
}

impl UserBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    pub fn password(mut self, value: impl Into<String>) -> Self {
        self.password = Some(value.into());
        self
    }

    pub fn profile(mut self, value: UserProfile) -> Self {
        self.profile = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`User`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](UserBuilder::id)
    /// - [`email`](UserBuilder::email)
    /// - [`password`](UserBuilder::password)
    /// - [`profile`](UserBuilder::profile)
    pub fn build(self) -> Result<User, BuildError> {
        Ok(User {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            email: self.email.ok_or_else(|| BuildError::missing_field("email"))?,
            password: self.password.ok_or_else(|| BuildError::missing_field("password"))?,
            profile: self.profile.ok_or_else(|| BuildError::missing_field("profile"))?,
        })
    }
}
