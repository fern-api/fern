pub use crate::prelude::*;

/// Query parameters for listwithextendedresultsandoptionaldata
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ListwithextendedresultsandoptionaldataQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

impl ListwithextendedresultsandoptionaldataQueryRequest {
    pub fn builder() -> ListwithextendedresultsandoptionaldataQueryRequestBuilder {
        <ListwithextendedresultsandoptionaldataQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ListwithextendedresultsandoptionaldataQueryRequestBuilder {
    cursor: Option<String>,
}

impl ListwithextendedresultsandoptionaldataQueryRequestBuilder {
    pub fn cursor(mut self, value: impl Into<String>) -> Self {
        self.cursor = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ListwithextendedresultsandoptionaldataQueryRequest`].
    pub fn build(self) -> Result<ListwithextendedresultsandoptionaldataQueryRequest, BuildError> {
        Ok(ListwithextendedresultsandoptionaldataQueryRequest {
            cursor: self.cursor,
        })
    }
}
