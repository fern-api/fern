pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NullableDeleteUserRequest {
    /// The user to delete.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
}

impl NullableDeleteUserRequest {
    pub fn builder() -> NullableDeleteUserRequestBuilder {
        <NullableDeleteUserRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NullableDeleteUserRequestBuilder {
    username: Option<String>,
}

impl NullableDeleteUserRequestBuilder {
    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NullableDeleteUserRequest`].
    pub fn build(self) -> Result<NullableDeleteUserRequest, BuildError> {
        Ok(NullableDeleteUserRequest {
            username: self.username,
        })
    }
}

