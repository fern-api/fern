pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ThankfulFactor {
    #[serde(default)]
    pub value: String,
}

impl ThankfulFactor {
    pub fn builder() -> ThankfulFactorBuilder {
        ThankfulFactorBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ThankfulFactorBuilder {
    value: Option<String>,
}

impl ThankfulFactorBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ThankfulFactor`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](ThankfulFactorBuilder::value)
    pub fn build(self) -> Result<ThankfulFactor, BuildError> {
        Ok(ThankfulFactor {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
