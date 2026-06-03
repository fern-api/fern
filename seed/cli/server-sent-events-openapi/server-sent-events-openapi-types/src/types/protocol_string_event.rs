pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ProtocolStringEvent {
    #[serde(default)]
    pub data: String,
}

impl ProtocolStringEvent {
    pub fn builder() -> ProtocolStringEventBuilder {
        <ProtocolStringEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ProtocolStringEventBuilder {
    data: Option<String>,
}

impl ProtocolStringEventBuilder {
    pub fn data(mut self, value: impl Into<String>) -> Self {
        self.data = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ProtocolStringEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](ProtocolStringEventBuilder::data)
    pub fn build(self) -> Result<ProtocolStringEvent, BuildError> {
        Ok(ProtocolStringEvent {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
