pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserListContainer {
    #[serde(default)]
    pub users: Vec<User>,
}

impl UserListContainer {
    pub fn builder() -> UserListContainerBuilder {
        <UserListContainerBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserListContainerBuilder {
    users: Option<Vec<User>>,
}

impl UserListContainerBuilder {
    pub fn users(mut self, value: Vec<User>) -> Self {
        self.users = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserListContainer`].
    /// This method will fail if any of the following fields are not set:
    /// - [`users`](UserListContainerBuilder::users)
    pub fn build(self) -> Result<UserListContainer, BuildError> {
        Ok(UserListContainer {
            users: self.users.ok_or_else(|| BuildError::missing_field("users"))?,
        })
    }
}
