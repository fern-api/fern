pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PrivatePayload {
    #[serde(default)]
    pub secret: String,
}

impl PrivatePayload {
    pub fn builder() -> PrivatePayloadBuilder {
        <PrivatePayloadBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PrivatePayloadBuilder {
    secret: Option<String>,
}

impl PrivatePayloadBuilder {
    pub fn secret(mut self, value: impl Into<String>) -> Self {
        self.secret = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PrivatePayload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`secret`](PrivatePayloadBuilder::secret)
    pub fn build(self) -> Result<PrivatePayload, BuildError> {
        Ok(PrivatePayload {
            secret: self.secret.ok_or_else(|| BuildError::missing_field("secret"))?,
        })
    }
}
