pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ProtocolNumberEvent {
    #[serde(default)]
    pub data: f64,
}

impl ProtocolNumberEvent {
    pub fn builder() -> ProtocolNumberEventBuilder {
        <ProtocolNumberEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ProtocolNumberEventBuilder {
    data: Option<f64>,
}

impl ProtocolNumberEventBuilder {
    pub fn data(mut self, value: f64) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ProtocolNumberEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](ProtocolNumberEventBuilder::data)
    pub fn build(self) -> Result<ProtocolNumberEvent, BuildError> {
        Ok(ProtocolNumberEvent {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
