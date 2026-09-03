pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Wrapper {
    pub payload: Payload,
}

impl Wrapper {
    pub fn builder() -> WrapperBuilder {
        <WrapperBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WrapperBuilder {
    payload: Option<Payload>,
}

impl WrapperBuilder {
    pub fn payload(mut self, value: Payload) -> Self {
        self.payload = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Wrapper`].
    /// This method will fail if any of the following fields are not set:
    /// - [`payload`](WrapperBuilder::payload)
    pub fn build(self) -> Result<Wrapper, BuildError> {
        Ok(Wrapper {
            payload: self.payload.ok_or_else(|| BuildError::missing_field("payload"))?,
        })
    }
}
