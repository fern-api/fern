pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct User {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub id: UserId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,
    #[serde(default)]
    pub email: Email,
    #[serde(rename = "favorite-number")]
    pub favorite_number: WeirdNumber,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub numbers: Option<Vec<i64>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub strings: Option<HashMap<String, serde_json::Value>>,
}

impl User {
    pub fn builder() -> UserBuilder {
        <UserBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserBuilder {
    name: Option<String>,
    id: Option<UserId>,
    tags: Option<Vec<String>>,
    metadata: Option<Metadata>,
    email: Option<Email>,
    favorite_number: Option<WeirdNumber>,
    numbers: Option<Vec<i64>>,
    strings: Option<HashMap<String, serde_json::Value>>,
}

impl UserBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn id(mut self, value: UserId) -> Self {
        self.id = Some(value);
        self
    }

    pub fn tags(mut self, value: Vec<String>) -> Self {
        self.tags = Some(value);
        self
    }

    pub fn metadata(mut self, value: Metadata) -> Self {
        self.metadata = Some(value);
        self
    }

    pub fn email(mut self, value: Email) -> Self {
        self.email = Some(value);
        self
    }

    pub fn favorite_number(mut self, value: WeirdNumber) -> Self {
        self.favorite_number = Some(value);
        self
    }

    pub fn numbers(mut self, value: Vec<i64>) -> Self {
        self.numbers = Some(value);
        self
    }

    pub fn strings(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.strings = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`User`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](UserBuilder::name)
    /// - [`id`](UserBuilder::id)
    /// - [`email`](UserBuilder::email)
    /// - [`favorite_number`](UserBuilder::favorite_number)
    pub fn build(self) -> Result<User, BuildError> {
        Ok(User {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            tags: self.tags,
            metadata: self.metadata,
            email: self
                .email
                .ok_or_else(|| BuildError::missing_field("email"))?,
            favorite_number: self
                .favorite_number
                .ok_or_else(|| BuildError::missing_field("favorite_number"))?,
            numbers: self.numbers,
            strings: self.strings,
        })
    }
}
