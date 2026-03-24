pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct User {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<i64>,
    #[serde(default)]
    pub is_active: bool,
    #[serde(default)]
    pub balance: f64,
    #[serde(default)]
    pub tags: Vec<String>,
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
    email: Option<String>,
    age: Option<i64>,
    is_active: Option<bool>,
    balance: Option<f64>,
    tags: Option<Vec<String>>,
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

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    pub fn age(mut self, value: i64) -> Self {
        self.age = Some(value);
        self
    }

    pub fn is_active(mut self, value: bool) -> Self {
        self.is_active = Some(value);
        self
    }

    pub fn balance(mut self, value: f64) -> Self {
        self.balance = Some(value);
        self
    }

    pub fn tags(mut self, value: Vec<String>) -> Self {
        self.tags = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`User`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](UserBuilder::id)
    /// - [`name`](UserBuilder::name)
    /// - [`email`](UserBuilder::email)
    /// - [`is_active`](UserBuilder::is_active)
    /// - [`balance`](UserBuilder::balance)
    /// - [`tags`](UserBuilder::tags)
    pub fn build(self) -> Result<User, BuildError> {
        Ok(User {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            email: self.email.ok_or_else(|| BuildError::missing_field("email"))?,
            age: self.age,
            is_active: self.is_active.ok_or_else(|| BuildError::missing_field("is_active"))?,
            balance: self.balance.ok_or_else(|| BuildError::missing_field("balance"))?,
            tags: self.tags.ok_or_else(|| BuildError::missing_field("tags"))?,
        })
    }
}
