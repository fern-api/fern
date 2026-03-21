pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UnwillingSmoke {
    #[serde(default)]
    pub value: String,
}

impl UnwillingSmoke {
    pub fn builder() -> UnwillingSmokeBuilder {
        UnwillingSmokeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnwillingSmokeBuilder {
    value: Option<String>,
}

impl UnwillingSmokeBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UnwillingSmoke`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](UnwillingSmokeBuilder::value)
    pub fn build(self) -> Result<UnwillingSmoke, BuildError> {
        Ok(UnwillingSmoke {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
