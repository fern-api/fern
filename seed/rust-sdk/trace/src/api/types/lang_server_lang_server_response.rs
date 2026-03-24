pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct LangServerResponse {
    pub response: serde_json::Value,
}

impl LangServerResponse {
    pub fn builder() -> LangServerResponseBuilder {
        LangServerResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LangServerResponseBuilder {
    response: Option<serde_json::Value>,
}

impl LangServerResponseBuilder {
    pub fn response(mut self, value: serde_json::Value) -> Self {
        self.response = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`LangServerResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`response`](LangServerResponseBuilder::response)
    pub fn build(self) -> Result<LangServerResponse, BuildError> {
        Ok(LangServerResponse {
            response: self
                .response
                .ok_or_else(|| BuildError::missing_field("response"))?,
        })
    }
}
