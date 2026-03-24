pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserOptionalListContainer2 {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub users: Option<Vec<User2>>,
}

impl UserOptionalListContainer2 {
    pub fn builder() -> UserOptionalListContainer2Builder {
        UserOptionalListContainer2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserOptionalListContainer2Builder {
    users: Option<Vec<User2>>,
}

impl UserOptionalListContainer2Builder {
    pub fn users(mut self, value: Vec<User2>) -> Self {
        self.users = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserOptionalListContainer2`].
    pub fn build(self) -> Result<UserOptionalListContainer2, BuildError> {
        Ok(UserOptionalListContainer2 { users: self.users })
    }
}
