pub use crate::prelude::*;

/// Query parameters for listwithglobalconfig
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListwithglobalconfigQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i64>,
}

impl ListwithglobalconfigQueryRequest {
    pub fn builder() -> ListwithglobalconfigQueryRequestBuilder {
        <ListwithglobalconfigQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListwithglobalconfigQueryRequestBuilder {
    offset: Option<i64>,
}

impl ListwithglobalconfigQueryRequestBuilder {
    pub fn offset(mut self, value: i64) -> Self {
        self.offset = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ListwithglobalconfigQueryRequest`].
    pub fn build(self) -> Result<ListwithglobalconfigQueryRequest, BuildError> {
        Ok(ListwithglobalconfigQueryRequest {
            offset: self.offset,
        })
    }
}
