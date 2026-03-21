pub use crate::prelude::*;

/// Query parameters for listUsernamesWithOptionalResponse
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsernamesWithOptionalResponseQueryRequest {
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl ListUsernamesWithOptionalResponseQueryRequest {
    pub fn builder() -> ListUsernamesWithOptionalResponseQueryRequestBuilder {
        ListUsernamesWithOptionalResponseQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsernamesWithOptionalResponseQueryRequestBuilder {
    starting_after: Option<String>,
}

impl ListUsernamesWithOptionalResponseQueryRequestBuilder {
    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListUsernamesWithOptionalResponseQueryRequest`].
    pub fn build(self) -> Result<ListUsernamesWithOptionalResponseQueryRequest, BuildError> {
        Ok(ListUsernamesWithOptionalResponseQueryRequest {
            starting_after: self.starting_after,
        })
    }
}
