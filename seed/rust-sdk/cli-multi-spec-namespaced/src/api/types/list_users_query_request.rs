pub use crate::prelude::*;

/// Query parameters for listUsers
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListUsersQueryRequest {
    #[serde(rename = "pageSize")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page_size: Option<i64>,
}

impl ListUsersQueryRequest {
    pub fn builder() -> ListUsersQueryRequestBuilder {
        <ListUsersQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListUsersQueryRequestBuilder {
    page_size: Option<i64>,
}

impl ListUsersQueryRequestBuilder {
    pub fn page_size(mut self, value: i64) -> Self {
        self.page_size = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListUsersQueryRequest`].
    pub fn build(self) -> Result<ListUsersQueryRequest, BuildError> {
        Ok(ListUsersQueryRequest {
            page_size: self.page_size,
        })
    }
}
