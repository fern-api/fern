pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserListContainer2 {
    #[serde(default)]
    pub users: Vec<User2>,
}

impl UserListContainer2 {
    pub fn builder() -> UserListContainer2Builder {
        <UserListContainer2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserListContainer2Builder {
    users: Option<Vec<User2>>,
}

impl UserListContainer2Builder {
    pub fn users(mut self, value: Vec<User2>) -> Self {
        self.users = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserListContainer2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`users`](UserListContainer2Builder::users)
    pub fn build(self) -> Result<UserListContainer2, BuildError> {
        Ok(UserListContainer2 {
            users: self
                .users
                .ok_or_else(|| BuildError::missing_field("users"))?,
        })
    }
}
