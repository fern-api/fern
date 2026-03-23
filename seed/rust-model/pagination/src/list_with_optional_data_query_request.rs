pub use crate::prelude::*;

/// Query parameters for listWithOptionalData
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListWithOptionalDataQueryRequest {
    /// Defaults to first page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
}

impl ListWithOptionalDataQueryRequest {
    pub fn builder() -> ListWithOptionalDataQueryRequestBuilder {
        ListWithOptionalDataQueryRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListWithOptionalDataQueryRequestBuilder {
    page: Option<i64>,
}

impl ListWithOptionalDataQueryRequestBuilder {
    pub fn page(mut self, value: i64) -> Self {
        self.page = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListWithOptionalDataQueryRequest`].
    pub fn build(self) -> Result<ListWithOptionalDataQueryRequest, BuildError> {
        Ok(ListWithOptionalDataQueryRequest {
            page: self.page,
        })
    }
}

