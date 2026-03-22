pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserOptionalListContainer {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub users: Option<Vec<User>>,
}

impl UserOptionalListContainer {
    pub fn builder() -> UserOptionalListContainerBuilder {
        UserOptionalListContainerBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserOptionalListContainerBuilder {
    users: Option<Vec<User>>,
}

impl UserOptionalListContainerBuilder {
    pub fn users(mut self, value: Vec<User>) -> Self {
        self.users = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserOptionalListContainer`].
    pub fn build(self) -> Result<UserOptionalListContainer, BuildError> {
        Ok(UserOptionalListContainer {
            users: self.users,
        })
    }
}
