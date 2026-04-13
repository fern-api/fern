pub use crate::prelude::*;

/// Query parameters for listusernames
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListusernamesQueryRequest {
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl ListusernamesQueryRequest {
    pub fn builder() -> ListusernamesQueryRequestBuilder {
        <ListusernamesQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListusernamesQueryRequestBuilder {
    starting_after: Option<String>,
}

impl ListusernamesQueryRequestBuilder {
    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListusernamesQueryRequest`].
    pub fn build(self) -> Result<ListusernamesQueryRequest, BuildError> {
        Ok(ListusernamesQueryRequest {
            starting_after: self.starting_after,
        })
    }
}

