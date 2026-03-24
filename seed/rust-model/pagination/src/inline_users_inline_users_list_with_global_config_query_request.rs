pub use crate::prelude::*;

/// Query parameters for listWithGlobalConfig
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListWithGlobalConfigQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i64>,
}

impl InlineUsersInlineUsersListWithGlobalConfigQueryRequest {
    pub fn builder() -> InlineUsersInlineUsersListWithGlobalConfigQueryRequestBuilder {
        InlineUsersInlineUsersListWithGlobalConfigQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersInlineUsersListWithGlobalConfigQueryRequestBuilder {
    offset: Option<i64>,
}

impl InlineUsersInlineUsersListWithGlobalConfigQueryRequestBuilder {
    pub fn offset(mut self, value: i64) -> Self {
        self.offset = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersInlineUsersListWithGlobalConfigQueryRequest`].
    pub fn build(self) -> Result<InlineUsersInlineUsersListWithGlobalConfigQueryRequest, BuildError> {
        Ok(InlineUsersInlineUsersListWithGlobalConfigQueryRequest {
            offset: self.offset,
        })
    }
}

