pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StatusPayload {
    #[serde(default)]
    pub message: String,
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub timestamp: DateTime<FixedOffset>,
}

impl StatusPayload {
    pub fn builder() -> StatusPayloadBuilder {
        StatusPayloadBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StatusPayloadBuilder {
    message: Option<String>,
    timestamp: Option<DateTime<FixedOffset>>,
}

impl StatusPayloadBuilder {
    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    pub fn timestamp(mut self, value: DateTime<FixedOffset>) -> Self {
        self.timestamp = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StatusPayload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`message`](StatusPayloadBuilder::message)
    /// - [`timestamp`](StatusPayloadBuilder::timestamp)
    pub fn build(self) -> Result<StatusPayload, BuildError> {
        Ok(StatusPayload {
            message: self.message.ok_or_else(|| BuildError::missing_field("message"))?,
            timestamp: self.timestamp.ok_or_else(|| BuildError::missing_field("timestamp"))?,
        })
    }
}
