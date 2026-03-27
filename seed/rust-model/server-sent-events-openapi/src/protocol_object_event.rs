pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ProtocolObjectEvent {
    #[serde(default)]
    pub data: StatusPayload,
}

impl ProtocolObjectEvent {
    pub fn builder() -> ProtocolObjectEventBuilder {
        ProtocolObjectEventBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ProtocolObjectEventBuilder {
    data: Option<StatusPayload>,
}

impl ProtocolObjectEventBuilder {
    pub fn data(mut self, value: StatusPayload) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ProtocolObjectEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](ProtocolObjectEventBuilder::data)
    pub fn build(self) -> Result<ProtocolObjectEvent, BuildError> {
        Ok(ProtocolObjectEvent {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
