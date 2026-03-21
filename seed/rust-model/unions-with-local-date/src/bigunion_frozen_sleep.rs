pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FrozenSleep {
    #[serde(default)]
    pub value: String,
}

impl FrozenSleep {
    pub fn builder() -> FrozenSleepBuilder {
        FrozenSleepBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FrozenSleepBuilder {
    value: Option<String>,
}

impl FrozenSleepBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FrozenSleep`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](FrozenSleepBuilder::value)
    pub fn build(self) -> Result<FrozenSleep, BuildError> {
        Ok(FrozenSleep {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
