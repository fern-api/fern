pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

/// Query parameters for listAccounts
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListAccountsQueryRequest {
    #[serde(rename = "pageSize")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page_size: Option<i64>,
}

impl ListAccountsQueryRequest {
    pub fn builder() -> ListAccountsQueryRequestBuilder {
        <ListAccountsQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListAccountsQueryRequestBuilder {
    page_size: Option<i64>,
}

impl ListAccountsQueryRequestBuilder {
    pub fn page_size(mut self, value: i64) -> Self {
        self.page_size = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListAccountsQueryRequest`].
    pub fn build(self) -> Result<ListAccountsQueryRequest, BuildError> {
        Ok(ListAccountsQueryRequest {
            page_size: self.page_size,
        })
    }
}

