pub use crate::prelude::*;

/// Query parameters for list
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListQueryRequest {
    #[serde(default)]
    pub limit: i64,
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
    /// This method will fail if any of the following fields are not set:
    /// - [`limit`](ListQueryRequestBuilder::limit)
    pub fn build(self) -> Result<ListQueryRequest, BuildError> {
        Ok(ListQueryRequest {
            limit: self.limit.ok_or_else(|| BuildError::missing_field("limit"))?,
        })
    }
}

