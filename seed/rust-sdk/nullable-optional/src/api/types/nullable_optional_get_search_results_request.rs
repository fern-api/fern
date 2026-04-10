pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct NullableOptionalGetSearchResultsRequest {
    #[serde(default)]
    pub query: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filters: Option<HashMap<String, Option<String>>>,
    #[serde(rename = "includeTypes")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_types: Option<Vec<String>>,
}

impl NullableOptionalGetSearchResultsRequest {
    pub fn builder() -> NullableOptionalGetSearchResultsRequestBuilder {
        <NullableOptionalGetSearchResultsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NullableOptionalGetSearchResultsRequestBuilder {
    query: Option<String>,
    filters: Option<HashMap<String, Option<String>>>,
    include_types: Option<Vec<String>>,
}

impl NullableOptionalGetSearchResultsRequestBuilder {
    pub fn query(mut self, value: impl Into<String>) -> Self {
        self.query = Some(value.into());
        self
    }

    pub fn filters(mut self, value: HashMap<String, Option<String>>) -> Self {
        self.filters = Some(value);
        self
    }

    pub fn include_types(mut self, value: Vec<String>) -> Self {
        self.include_types = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NullableOptionalGetSearchResultsRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`query`](NullableOptionalGetSearchResultsRequestBuilder::query)
    pub fn build(self) -> Result<NullableOptionalGetSearchResultsRequest, BuildError> {
        Ok(NullableOptionalGetSearchResultsRequest {
            query: self
                .query
                .ok_or_else(|| BuildError::missing_field("query"))?,
            filters: self.filters,
            include_types: self.include_types,
        })
    }
}
