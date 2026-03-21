pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RotatingRatio {
    #[serde(default)]
    pub value: String,
}

impl RotatingRatio {
    pub fn builder() -> RotatingRatioBuilder {
        RotatingRatioBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RotatingRatioBuilder {
    value: Option<String>,
}

impl RotatingRatioBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`RotatingRatio`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](RotatingRatioBuilder::value)
    pub fn build(self) -> Result<RotatingRatio, BuildError> {
        Ok(RotatingRatio {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
