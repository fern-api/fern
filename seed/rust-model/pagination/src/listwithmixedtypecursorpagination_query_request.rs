pub use crate::prelude::*;

/// Query parameters for listwithmixedtypecursorpagination
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListwithmixedtypecursorpaginationQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl ListwithmixedtypecursorpaginationQueryRequest {
    pub fn builder() -> ListwithmixedtypecursorpaginationQueryRequestBuilder {
        <ListwithmixedtypecursorpaginationQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListwithmixedtypecursorpaginationQueryRequestBuilder {
    cursor: Option<String>,
}

impl ListwithmixedtypecursorpaginationQueryRequestBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListwithmixedtypecursorpaginationQueryRequest`].
    pub fn build(self) -> Result<ListwithmixedtypecursorpaginationQueryRequest, BuildError> {
        Ok(ListwithmixedtypecursorpaginationQueryRequest {
            cursor: self.cursor,
        })
    }
}

