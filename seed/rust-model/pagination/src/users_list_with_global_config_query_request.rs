pub use crate::prelude::*;

/// Query parameters for listWithGlobalConfig
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListWithGlobalConfigQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i64>,
}

impl UsersListWithGlobalConfigQueryRequest {
    pub fn builder() -> UsersListWithGlobalConfigQueryRequestBuilder {
        UsersListWithGlobalConfigQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersListWithGlobalConfigQueryRequestBuilder {
    offset: Option<i64>,
}

impl UsersListWithGlobalConfigQueryRequestBuilder {
    pub fn offset(mut self, value: i64) -> Self {
        self.offset = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsersListWithGlobalConfigQueryRequest`].
    pub fn build(self) -> Result<UsersListWithGlobalConfigQueryRequest, BuildError> {
        Ok(UsersListWithGlobalConfigQueryRequest {
            offset: self.offset,
        })
    }
}

