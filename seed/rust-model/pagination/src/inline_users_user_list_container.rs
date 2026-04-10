pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersUserListContainer {
    #[serde(default)]
    pub users: Vec<InlineUsersUser>,
}

impl InlineUsersUserListContainer {
    pub fn builder() -> InlineUsersUserListContainerBuilder {
        <InlineUsersUserListContainerBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersUserListContainerBuilder {
    users: Option<Vec<InlineUsersUser>>,
}

impl InlineUsersUserListContainerBuilder {
    pub fn users(mut self, value: Vec<InlineUsersUser>) -> Self {
        self.users = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersUserListContainer`].
    /// This method will fail if any of the following fields are not set:
    /// - [`users`](InlineUsersUserListContainerBuilder::users)
    pub fn build(self) -> Result<InlineUsersUserListContainer, BuildError> {
        Ok(InlineUsersUserListContainer {
            users: self.users.ok_or_else(|| BuildError::missing_field("users"))?,
        })
    }
}
