pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct User {
    #[serde(default)]
    pub id: Id,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub age: i64,
}

impl User {
    pub fn builder() -> UserBuilder {
        UserBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserBuilder {
    id: Option<Id>,
    name: Option<String>,
    age: Option<i64>,
}

impl UserBuilder {
    pub fn id(mut self, value: Id) -> Self {
        self.id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn age(mut self, value: i64) -> Self {
        self.age = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`User`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](UserBuilder::id)
    /// - [`name`](UserBuilder::name)
    /// - [`age`](UserBuilder::age)
    pub fn build(self) -> Result<User, BuildError> {
        Ok(User {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            age: self.age.ok_or_else(|| BuildError::missing_field("age"))?,
        })
    }
}
