pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserProfile {
    #[serde(default)]
    pub user_id: UserId,
    #[serde(default)]
    pub email: UserEmail,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<UserAge>,
    #[serde(default)]
    pub tags: UserTags,
}

impl UserProfile {
    pub fn builder() -> UserProfileBuilder {
        <UserProfileBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserProfileBuilder {
    user_id: Option<UserId>,
    email: Option<UserEmail>,
    age: Option<UserAge>,
    tags: Option<UserTags>,
}

impl UserProfileBuilder {
    pub fn user_id(mut self, value: UserId) -> Self {
        self.user_id = Some(value);
        self
    }

    pub fn email(mut self, value: UserEmail) -> Self {
        self.email = Some(value);
        self
    }

    pub fn age(mut self, value: UserAge) -> Self {
        self.age = Some(value);
        self
    }

    pub fn tags(mut self, value: UserTags) -> Self {
        self.tags = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserProfile`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_id`](UserProfileBuilder::user_id)
    /// - [`email`](UserProfileBuilder::email)
    /// - [`tags`](UserProfileBuilder::tags)
    pub fn build(self) -> Result<UserProfile, BuildError> {
        Ok(UserProfile {
            user_id: self.user_id.ok_or_else(|| BuildError::missing_field("user_id"))?,
            email: self.email.ok_or_else(|| BuildError::missing_field("email"))?,
            age: self.age,
            tags: self.tags.ok_or_else(|| BuildError::missing_field("tags"))?,
        })
    }
}
