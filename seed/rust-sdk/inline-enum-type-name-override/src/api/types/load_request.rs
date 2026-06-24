pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct LoadRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cache: Option<LoadRequestCache>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<LoadRequestStatus>,
}

impl LoadRequest {
    pub fn builder() -> LoadRequestBuilder {
        <LoadRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LoadRequestBuilder {
    cache: Option<LoadRequestCache>,
    status: Option<LoadRequestStatus>,
}

impl LoadRequestBuilder {
    pub fn cache(mut self, value: LoadRequestCache) -> Self {
        self.cache = Some(value);
        self
    }

    pub fn status(mut self, value: LoadRequestStatus) -> Self {
        self.status = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`LoadRequest`].
    pub fn build(self) -> Result<LoadRequest, BuildError> {
        Ok(LoadRequest {
            cache: self.cache,
            status: self.status,
        })
    }
}
