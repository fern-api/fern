pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct User {
    #[serde(default)]
    pub name: String,
}

impl User {
    pub fn builder() -> UserBuilder {
        UserBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserBuilder {
    name: Option<String>,
}

impl UserBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`User`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](UserBuilder::name)
    pub fn build(self) -> Result<User, BuildError> {
        Ok(User {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
