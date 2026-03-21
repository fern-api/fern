pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PopularLimit {
    #[serde(default)]
    pub value: String,
}

impl PopularLimit {
    pub fn builder() -> PopularLimitBuilder {
        PopularLimitBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PopularLimitBuilder {
    value: Option<String>,
}

impl PopularLimitBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PopularLimit`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](PopularLimitBuilder::value)
    pub fn build(self) -> Result<PopularLimit, BuildError> {
        Ok(PopularLimit {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
