pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersUsers {
    #[serde(default)]
    pub users: Vec<InlineUsersUser>,
}

impl InlineUsersUsers {
    pub fn builder() -> InlineUsersUsersBuilder {
        <InlineUsersUsersBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersUsersBuilder {
    users: Option<Vec<InlineUsersUser>>,
}

impl InlineUsersUsersBuilder {
    pub fn users(mut self, value: Vec<InlineUsersUser>) -> Self {
        self.users = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersUsers`].
    /// This method will fail if any of the following fields are not set:
    /// - [`users`](InlineUsersUsersBuilder::users)
    pub fn build(self) -> Result<InlineUsersUsers, BuildError> {
        Ok(InlineUsersUsers {
            users: self
                .users
                .ok_or_else(|| BuildError::missing_field("users"))?,
        })
    }
}
