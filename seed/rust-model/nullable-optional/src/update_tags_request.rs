pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UpdateTagsRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub categories: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub labels: Option<Vec<String>>,
}

impl UpdateTagsRequest {
    pub fn builder() -> UpdateTagsRequestBuilder {
        <UpdateTagsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UpdateTagsRequestBuilder {
    tags: Option<Vec<String>>,
    categories: Option<Vec<String>>,
    labels: Option<Vec<String>>,
}

impl UpdateTagsRequestBuilder {
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

    /// Consumes the builder and constructs a [`UpdateTagsRequest`].
    pub fn build(self) -> Result<UpdateTagsRequest, BuildError> {
        Ok(UpdateTagsRequest {
            tags: self.tags,
            categories: self.categories,
            labels: self.labels,
        })
    }
}

