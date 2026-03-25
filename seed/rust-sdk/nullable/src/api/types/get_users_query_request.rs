pub use crate::prelude::*;

/// Query parameters for getUsers
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetUsersQueryRequest {
    #[serde(default)]
    pub usernames: Vec<Option<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar: Option<String>,
    #[serde(default)]
    pub activated: Vec<Option<bool>>,
    #[serde(default)]
    pub tags: Vec<Option<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extra: Option<bool>,
}

impl GetUsersQueryRequest {
    pub fn builder() -> GetUsersQueryRequestBuilder {
        GetUsersQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetUsersQueryRequestBuilder {
    usernames: Option<Vec<Option<String>>>,
    avatar: Option<String>,
    activated: Option<Vec<Option<bool>>>,
    tags: Option<Vec<Option<String>>>,
    extra: Option<bool>,
}

impl GetUsersQueryRequestBuilder {
    pub fn usernames(mut self, value: Vec<Option<String>>) -> Self {
        self.usernames = Some(value);
        self
    }

    pub fn avatar(mut self, value: impl Into<String>) -> Self {
        self.avatar = Some(value.into());
        self
    }

    pub fn activated(mut self, value: Vec<Option<bool>>) -> Self {
        self.activated = Some(value);
        self
    }

    pub fn tags(mut self, value: Vec<Option<String>>) -> Self {
        self.tags = Some(value);
        self
    }

    pub fn extra(mut self, value: bool) -> Self {
        self.extra = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetUsersQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`usernames`](GetUsersQueryRequestBuilder::usernames)
    /// - [`activated`](GetUsersQueryRequestBuilder::activated)
    /// - [`tags`](GetUsersQueryRequestBuilder::tags)
    pub fn build(self) -> Result<GetUsersQueryRequest, BuildError> {
        Ok(GetUsersQueryRequest {
            usernames: self
                .usernames
                .ok_or_else(|| BuildError::missing_field("usernames"))?,
            avatar: self.avatar,
            activated: self
                .activated
                .ok_or_else(|| BuildError::missing_field("activated"))?,
            tags: self.tags.ok_or_else(|| BuildError::missing_field("tags"))?,
            extra: self.extra,
        })
    }
}
