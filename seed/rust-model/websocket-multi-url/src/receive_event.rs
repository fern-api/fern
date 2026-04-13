pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ReceiveEvent {
    #[serde(default)]
    pub data: String,
    #[serde(default)]
    pub timestamp: i64,
}

impl ReceiveEvent {
    pub fn builder() -> ReceiveEventBuilder {
        <ReceiveEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ReceiveEventBuilder {
    data: Option<String>,
    timestamp: Option<i64>,
}

impl ReceiveEventBuilder {
    pub fn data(mut self, value: impl Into<String>) -> Self {
        self.data = Some(value.into());
        self
    }

    pub fn timestamp(mut self, value: i64) -> Self {
        self.timestamp = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ReceiveEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](ReceiveEventBuilder::data)
    /// - [`timestamp`](ReceiveEventBuilder::timestamp)
    pub fn build(self) -> Result<ReceiveEvent, BuildError> {
        Ok(ReceiveEvent {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
            timestamp: self.timestamp.ok_or_else(|| BuildError::missing_field("timestamp"))?,
        })
    }
}
