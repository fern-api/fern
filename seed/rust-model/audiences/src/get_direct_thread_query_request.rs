pub use crate::prelude::*;

/// Query parameters for getDirectThread
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetDirectThreadQueryRequest {
    #[serde(default)]
    pub ids: Vec<String>,
    #[serde(default)]
    pub tags: Vec<String>,
}

impl GetDirectThreadQueryRequest {
    pub fn builder() -> GetDirectThreadQueryRequestBuilder {
        <GetDirectThreadQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetDirectThreadQueryRequestBuilder {
    ids: Option<Vec<String>>,
    tags: Option<Vec<String>>,
}

impl GetDirectThreadQueryRequestBuilder {
    pub fn ids(mut self, value: Vec<String>) -> Self {
        self.ids = Some(value);
        self
    }

    pub fn tags(mut self, value: Vec<String>) -> Self {
        self.tags = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetDirectThreadQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`ids`](GetDirectThreadQueryRequestBuilder::ids)
    /// - [`tags`](GetDirectThreadQueryRequestBuilder::tags)
    pub fn build(self) -> Result<GetDirectThreadQueryRequest, BuildError> {
        Ok(GetDirectThreadQueryRequest {
            ids: self.ids.ok_or_else(|| BuildError::missing_field("ids"))?,
            tags: self.tags.ok_or_else(|| BuildError::missing_field("tags"))?,
        })
    }
}

