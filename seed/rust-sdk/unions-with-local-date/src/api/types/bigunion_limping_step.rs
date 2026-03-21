pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct LimpingStep {
    #[serde(default)]
    pub value: String,
}

impl LimpingStep {
    pub fn builder() -> LimpingStepBuilder {
        LimpingStepBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LimpingStepBuilder {
    value: Option<String>,
}

impl LimpingStepBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`LimpingStep`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](LimpingStepBuilder::value)
    pub fn build(self) -> Result<LimpingStep, BuildError> {
        Ok(LimpingStep {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
