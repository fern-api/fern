pub use crate::prelude::*;

/// Query parameters for listUsernames
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsersListUsernamesQueryRequest {
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl UsersListUsernamesQueryRequest {
    pub fn builder() -> UsersListUsernamesQueryRequestBuilder {
        <UsersListUsernamesQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsersListUsernamesQueryRequestBuilder {
    starting_after: Option<String>,
}

impl UsersListUsernamesQueryRequestBuilder {
    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UsersListUsernamesQueryRequest`].
    pub fn build(self) -> Result<UsersListUsernamesQueryRequest, BuildError> {
        Ok(UsersListUsernamesQueryRequest {
            starting_after: self.starting_after,
        })
    }
}
