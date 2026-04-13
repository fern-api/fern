pub use crate::prelude::*;

/// Query parameters for listusernameswithoptionalresponse
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListusernameswithoptionalresponseQueryRequest {
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub starting_after: Option<String>,
}

impl ListusernameswithoptionalresponseQueryRequest {
    pub fn builder() -> ListusernameswithoptionalresponseQueryRequestBuilder {
        <ListusernameswithoptionalresponseQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListusernameswithoptionalresponseQueryRequestBuilder {
    starting_after: Option<String>,
}

impl ListusernameswithoptionalresponseQueryRequestBuilder {
    pub fn starting_after(mut self, value: impl Into<String>) -> Self {
        self.starting_after = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListusernameswithoptionalresponseQueryRequest`].
    pub fn build(self) -> Result<ListusernameswithoptionalresponseQueryRequest, BuildError> {
        Ok(ListusernameswithoptionalresponseQueryRequest {
            starting_after: self.starting_after,
        })
    }
}
