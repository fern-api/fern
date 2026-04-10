pub use crate::prelude::*;

/// Query parameters for listwithoptionaldata
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListwithoptionaldataQueryRequest {
    /// Defaults to first page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
}

impl ListwithoptionaldataQueryRequest {
    pub fn builder() -> ListwithoptionaldataQueryRequestBuilder {
        <ListwithoptionaldataQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListwithoptionaldataQueryRequestBuilder {
    page: Option<i64>,
}

impl ListwithoptionaldataQueryRequestBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListwithoptionaldataQueryRequest`].
    pub fn build(self) -> Result<ListwithoptionaldataQueryRequest, BuildError> {
        Ok(ListwithoptionaldataQueryRequest {
            page: self.page,
        })
    }
}

