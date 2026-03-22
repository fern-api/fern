pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Response {
    pub response: serde_json::Value,
    #[serde(default)]
    pub identifiers: Vec<Identifier>,
}

impl Response {
    pub fn builder() -> ResponseBuilder {
        ResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ResponseBuilder {
    response: Option<serde_json::Value>,
    identifiers: Option<Vec<Identifier>>,
}

impl ResponseBuilder {
    pub fn response(mut self, value: serde_json::Value) -> Self {
        self.response = Some(value);
        self
    }

    pub fn identifiers(mut self, value: Vec<Identifier>) -> Self {
        self.identifiers = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Response`].
    /// This method will fail if any of the following fields are not set:
    /// - [`response`](ResponseBuilder::response)
    /// - [`identifiers`](ResponseBuilder::identifiers)
    pub fn build(self) -> Result<Response, BuildError> {
        Ok(Response {
            response: self
                .response
                .ok_or_else(|| BuildError::missing_field("response"))?,
            identifiers: self
                .identifiers
                .ok_or_else(|| BuildError::missing_field("identifiers"))?,
        })
    }
}
