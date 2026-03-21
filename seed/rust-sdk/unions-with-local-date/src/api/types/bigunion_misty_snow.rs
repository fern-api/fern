pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct MistySnow {
    #[serde(default)]
    pub value: String,
}

impl MistySnow {
    pub fn builder() -> MistySnowBuilder {
        MistySnowBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MistySnowBuilder {
    value: Option<String>,
}

impl MistySnowBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`MistySnow`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](MistySnowBuilder::value)
    pub fn build(self) -> Result<MistySnow, BuildError> {
        Ok(MistySnow {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
