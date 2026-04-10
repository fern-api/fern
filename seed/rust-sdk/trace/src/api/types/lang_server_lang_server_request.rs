pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct LangServerRequest {
    pub request: serde_json::Value,
}

impl LangServerRequest {
    pub fn builder() -> LangServerRequestBuilder {
        <LangServerRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LangServerRequestBuilder {
    request: Option<serde_json::Value>,
}

impl LangServerRequestBuilder {
    pub fn request(mut self, value: serde_json::Value) -> Self {
        self.request = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`LangServerRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`request`](LangServerRequestBuilder::request)
    pub fn build(self) -> Result<LangServerRequest, BuildError> {
        Ok(LangServerRequest {
            request: self
                .request
                .ok_or_else(|| BuildError::missing_field("request"))?,
        })
    }
}
