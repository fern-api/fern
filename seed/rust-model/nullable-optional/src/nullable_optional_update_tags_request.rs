pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NullableOptionalUpdateTagsRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub categories: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub labels: Option<Vec<String>>,
}

impl NullableOptionalUpdateTagsRequest {
    pub fn builder() -> NullableOptionalUpdateTagsRequestBuilder {
        <NullableOptionalUpdateTagsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NullableOptionalUpdateTagsRequestBuilder {
    tags: Option<Vec<String>>,
    categories: Option<Vec<String>>,
    labels: Option<Vec<String>>,
}

impl NullableOptionalUpdateTagsRequestBuilder {
    pub fn tags(mut self, value: Vec<String>) -> Self {
        self.tags = Some(value);
        self
    }

    pub fn categories(mut self, value: Vec<String>) -> Self {
        self.categories = Some(value);
        self
    }

    pub fn labels(mut self, value: Vec<String>) -> Self {
        self.labels = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NullableOptionalUpdateTagsRequest`].
    pub fn build(self) -> Result<NullableOptionalUpdateTagsRequest, BuildError> {
        Ok(NullableOptionalUpdateTagsRequest {
            tags: self.tags,
            categories: self.categories,
            labels: self.labels,
        })
    }
}

