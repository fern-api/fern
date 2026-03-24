pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DeleteUserRequest {
    /// The user to delete.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
}

impl DeleteUserRequest {
    pub fn builder() -> DeleteUserRequestBuilder {
        DeleteUserRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DeleteUserRequestBuilder {
    username: Option<String>,
}

impl DeleteUserRequestBuilder {
    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`DeleteUserRequest`].
    pub fn build(self) -> Result<DeleteUserRequest, BuildError> {
        Ok(DeleteUserRequest {
            username: self.username,
        })
    }
}

