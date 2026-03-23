pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct CreateUserRequest {
    #[serde(default)]
    pub username: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar: Option<String>,
}

impl CreateUserRequest {
    pub fn builder() -> CreateUserRequestBuilder {
        CreateUserRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateUserRequestBuilder {
    username: Option<String>,
    tags: Option<Vec<String>>,
    metadata: Option<Metadata>,
    avatar: Option<String>,
}

impl CreateUserRequestBuilder {
    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
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

    pub fn avatar(mut self, value: impl Into<String>) -> Self {
        self.avatar = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreateUserRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`username`](CreateUserRequestBuilder::username)
    pub fn build(self) -> Result<CreateUserRequest, BuildError> {
        Ok(CreateUserRequest {
            username: self.username.ok_or_else(|| BuildError::missing_field("username"))?,
            tags: self.tags,
            metadata: self.metadata,
            avatar: self.avatar,
        })
    }
}

