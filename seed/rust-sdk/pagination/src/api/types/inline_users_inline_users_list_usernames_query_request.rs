pub use crate::prelude::*;

/// Query parameters for listUsernames
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct InlineUsersInlineUsersListUsernamesQueryRequest {
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl InlineUsersInlineUsersListUsernamesQueryRequest {
    pub fn builder() -> InlineUsersInlineUsersListUsernamesQueryRequestBuilder {
        <InlineUsersInlineUsersListUsernamesQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InlineUsersInlineUsersListUsernamesQueryRequestBuilder {
    starting_after: Option<String>,
}

impl InlineUsersInlineUsersListUsernamesQueryRequestBuilder {
    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`InlineUsersInlineUsersListUsernamesQueryRequest`].
    pub fn build(self) -> Result<InlineUsersInlineUsersListUsernamesQueryRequest, BuildError> {
        Ok(InlineUsersInlineUsersListUsernamesQueryRequest {
            starting_after: self.starting_after,
        })
    }
}
