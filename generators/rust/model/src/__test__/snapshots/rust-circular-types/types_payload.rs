pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Payload {
    pub data: serde_json::Value,
}

impl Payload {
    pub fn builder() -> PayloadBuilder {
        <PayloadBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PayloadBuilder {
    data: Option<serde_json::Value>,
}

impl PayloadBuilder {
    pub fn data(mut self, value: serde_json::Value) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Payload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](PayloadBuilder::data)
    pub fn build(self) -> Result<Payload, BuildError> {
        Ok(Payload {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
