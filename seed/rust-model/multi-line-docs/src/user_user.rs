pub use crate::prelude::*;

/// A user object. This type is used throughout the following APIs:
/// - createUser
/// - getUser
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct User {
    #[serde(default)]
    pub id: String,
    /// The user's name. This name is unique to each user. A few examples are included below:
    /// - Alice
    /// - Bob
    /// - Charlie
    #[serde(default)]
    pub name: String,
    /// The user's age.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<i64>,
}

impl User {
    pub fn builder() -> UserBuilder {
        UserBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserBuilder {
    id: Option<String>,
    name: Option<String>,
    age: Option<i64>,
}

impl UserBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
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
    pub fn build(self) -> Result<User, BuildError> {
        Ok(User {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            age: self.age,
        })
    }
}
