pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Request {
    pub request: serde_json::Value,
}

impl Request {
    pub fn builder() -> RequestBuilder {
        <RequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RequestBuilder {
    request: Option<serde_json::Value>,
}

impl RequestBuilder {
    pub fn request(mut self, value: serde_json::Value) -> Self {
        self.request = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Request`].
    /// This method will fail if any of the following fields are not set:
    /// - [`request`](RequestBuilder::request)
    pub fn build(self) -> Result<Request, BuildError> {
        Ok(Request {
            request: self.request.ok_or_else(|| BuildError::missing_field("request"))?,
        })
    }
}
