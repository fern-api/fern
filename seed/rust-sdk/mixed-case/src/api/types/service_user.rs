pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct User {
    #[serde(rename = "userName")]
    #[serde(default)]
    pub user_name: String,
    #[serde(default)]
    pub metadata_tags: Vec<String>,
    #[serde(rename = "EXTRA_PROPERTIES")]
    #[serde(default)]
    pub extra_properties: HashMap<String, String>,
}

impl User {
    pub fn builder() -> UserBuilder {
        UserBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserBuilder {
    user_name: Option<String>,
    metadata_tags: Option<Vec<String>>,
    extra_properties: Option<HashMap<String, String>>,
}

impl UserBuilder {
    pub fn user_name(mut self, value: impl Into<String>) -> Self {
        self.user_name = Some(value.into());
        self
    }

    pub fn metadata_tags(mut self, value: Vec<String>) -> Self {
        self.metadata_tags = Some(value);
        self
    }

    pub fn extra_properties(mut self, value: HashMap<String, String>) -> Self {
        self.extra_properties = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`User`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_name`](UserBuilder::user_name)
    /// - [`metadata_tags`](UserBuilder::metadata_tags)
    /// - [`extra_properties`](UserBuilder::extra_properties)
    pub fn build(self) -> Result<User, BuildError> {
        Ok(User {
            user_name: self.user_name.ok_or_else(|| BuildError::missing_field("user_name"))?,
            metadata_tags: self.metadata_tags.ok_or_else(|| BuildError::missing_field("metadata_tags"))?,
            extra_properties: self.extra_properties.ok_or_else(|| BuildError::missing_field("extra_properties"))?,
        })
    }
}
