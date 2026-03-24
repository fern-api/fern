pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendOptionalBodyRequest {
    #[serde(default)]
    pub message: String,
}

impl SendOptionalBodyRequest {
    pub fn builder() -> SendOptionalBodyRequestBuilder {
        SendOptionalBodyRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendOptionalBodyRequestBuilder {
    message: Option<String>,
}

impl SendOptionalBodyRequestBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`SendOptionalBodyRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](SendOptionalBodyRequestBuilder::message)
    pub fn build(self) -> Result<SendOptionalBodyRequest, BuildError> {
        Ok(SendOptionalBodyRequest {
            message: self
                .message
                .ok_or_else(|| BuildError::missing_field("message"))?,
        })
    }
}
