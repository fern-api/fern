pub use crate::prelude::*;

/// Query parameters for list
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListQueryRequest {
    /// The maximum number of results to return.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}

impl ListQueryRequest {
    pub fn builder() -> ListQueryRequestBuilder {
        <ListQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListQueryRequestBuilder {
    limit: Option<i64>,
}

impl ListQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListQueryRequest`].
    pub fn build(self) -> Result<ListQueryRequest, BuildError> {
        Ok(ListQueryRequest { limit: self.limit })
    }
}
