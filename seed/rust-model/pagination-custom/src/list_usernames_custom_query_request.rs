pub use crate::prelude::*;

/// Query parameters for listUsernamesCustom
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsernamesCustomQueryRequest {
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl ListUsernamesCustomQueryRequest {
    pub fn builder() -> ListUsernamesCustomQueryRequestBuilder {
        <ListUsernamesCustomQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsernamesCustomQueryRequestBuilder {
    starting_after: Option<String>,
}

impl ListUsernamesCustomQueryRequestBuilder {
    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListUsernamesCustomQueryRequest`].
    pub fn build(self) -> Result<ListUsernamesCustomQueryRequest, BuildError> {
        Ok(ListUsernamesCustomQueryRequest {
            starting_after: self.starting_after,
        })
    }
}

