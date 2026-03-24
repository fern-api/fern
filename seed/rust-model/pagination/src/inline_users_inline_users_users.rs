pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Users {
    #[serde(default)]
    pub users: Vec<User>,
}

impl Users {
    pub fn builder() -> UsersBuilder {
        UsersBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersBuilder {
    users: Option<Vec<User>>,
}

impl UsersBuilder {
    pub fn users(mut self, value: Vec<User>) -> Self {
        self.users = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Users`].
    /// This method will fail if any of the following fields are not set:
    /// - [`users`](UsersBuilder::users)
    pub fn build(self) -> Result<Users, BuildError> {
        Ok(Users {
            users: self.users.ok_or_else(|| BuildError::missing_field("users"))?,
        })
    }
}
