pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct HarmoniousPlay {
    #[serde(default)]
    pub value: String,
}

impl HarmoniousPlay {
    pub fn builder() -> HarmoniousPlayBuilder {
        HarmoniousPlayBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct HarmoniousPlayBuilder {
    value: Option<String>,
}

impl HarmoniousPlayBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`HarmoniousPlay`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](HarmoniousPlayBuilder::value)
    pub fn build(self) -> Result<HarmoniousPlay, BuildError> {
        Ok(HarmoniousPlay {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
