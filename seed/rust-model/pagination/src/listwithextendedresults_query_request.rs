pub use crate::prelude::*;

/// Query parameters for listwithextendedresults
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListwithextendedresultsQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl ListwithextendedresultsQueryRequest {
    pub fn builder() -> ListwithextendedresultsQueryRequestBuilder {
        <ListwithextendedresultsQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListwithextendedresultsQueryRequestBuilder {
    cursor: Option<String>,
}

impl ListwithextendedresultsQueryRequestBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListwithextendedresultsQueryRequest`].
    pub fn build(self) -> Result<ListwithextendedresultsQueryRequest, BuildError> {
        Ok(ListwithextendedresultsQueryRequest {
            cursor: self.cursor,
        })
    }
}

