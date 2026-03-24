pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct User {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub id: i64,
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
    id: Option<i64>,
}

impl UserBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn id(mut self, value: i64) -> Self {
        self.id = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`User`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](UserBuilder::name)
    /// - [`id`](UserBuilder::id)
    pub fn build(self) -> Result<User, BuildError> {
        Ok(User {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
        })
    }
}
