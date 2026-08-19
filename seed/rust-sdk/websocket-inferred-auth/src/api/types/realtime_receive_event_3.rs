pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ReceiveEvent3 {
    #[serde(rename = "receiveText3")]
    #[serde(default)]
    pub receive_text3: String,
}

impl ReceiveEvent3 {
    pub fn builder() -> ReceiveEvent3Builder {
        <ReceiveEvent3Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ReceiveEvent3Builder {
    receive_text3: Option<String>,
}

impl ReceiveEvent3Builder {
    pub fn receive_text3(mut self, value: impl Into<String>) -> Self {
        self.receive_text3 = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ReceiveEvent3`].
    /// This method will fail if any of the following fields are not set:
    /// - [`receive_text3`](ReceiveEvent3Builder::receive_text3)
    pub fn build(self) -> Result<ReceiveEvent3, BuildError> {
        Ok(ReceiveEvent3 {
            receive_text3: self
                .receive_text3
                .ok_or_else(|| BuildError::missing_field("receive_text3"))?,
        })
    }
}
