pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RateLimitErrorBody {
    #[serde(default)]
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub retry_after_seconds: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
}

impl RateLimitErrorBody {
    pub fn builder() -> RateLimitErrorBodyBuilder {
        <RateLimitErrorBodyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RateLimitErrorBodyBuilder {
    message: Option<String>,
    retry_after_seconds: Option<i64>,
    details: Option<String>,
}

impl RateLimitErrorBodyBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    pub fn retry_after_seconds(mut self, value: i64) -> Self {
        self.retry_after_seconds = Some(value);
        self
    }

    pub fn details(mut self, value: impl Into<String>) -> Self {
        self.details = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`RateLimitErrorBody`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](RateLimitErrorBodyBuilder::message)
    pub fn build(self) -> Result<RateLimitErrorBody, BuildError> {
        Ok(RateLimitErrorBody {
            message: self
                .message
                .ok_or_else(|| BuildError::missing_field("message"))?,
            retry_after_seconds: self.retry_after_seconds,
            details: self.details,
        })
    }
}
