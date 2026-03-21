pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendResponse {
    #[serde(default)]
    pub message: String,
    #[serde(default)]
    pub status: i64,
    pub success: bool,
}

impl SendResponse {
    pub fn builder() -> SendResponseBuilder {
        SendResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendResponseBuilder {
    message: Option<String>,
    status: Option<i64>,
    success: Option<bool>,
}

impl SendResponseBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    pub fn status(mut self, value: i64) -> Self {
        self.status = Some(value);
        self
    }

    pub fn success(mut self, value: bool) -> Self {
        self.success = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SendResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](SendResponseBuilder::message)
    /// - [`status`](SendResponseBuilder::status)
    /// - [`success`](SendResponseBuilder::success)
    pub fn build(self) -> Result<SendResponse, BuildError> {
        Ok(SendResponse {
            message: self.message.ok_or_else(|| BuildError::missing_field("message"))?,
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
            success: self.success.ok_or_else(|| BuildError::missing_field("success"))?,
        })
    }
}
