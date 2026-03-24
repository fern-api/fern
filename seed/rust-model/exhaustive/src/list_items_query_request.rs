pub use crate::prelude::*;

/// Query parameters for listItems
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListItemsQueryRequest {
    /// The cursor for pagination
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
    /// Maximum number of items to return
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}

impl ListItemsQueryRequest {
    pub fn builder() -> ListItemsQueryRequestBuilder {
        ListItemsQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListItemsQueryRequestBuilder {
    cursor: Option<String>,
    limit: Option<i64>,
}

impl ListItemsQueryRequestBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListItemsQueryRequest`].
    pub fn build(self) -> Result<ListItemsQueryRequest, BuildError> {
        Ok(ListItemsQueryRequest {
            cursor: self.cursor,
            limit: self.limit,
        })
    }
}

