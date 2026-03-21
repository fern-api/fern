pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NormalSweet {
    #[serde(default)]
    pub value: String,
}

impl NormalSweet {
    pub fn builder() -> NormalSweetBuilder {
        NormalSweetBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NormalSweetBuilder {
    value: Option<String>,
}

impl NormalSweetBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NormalSweet`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](NormalSweetBuilder::value)
    pub fn build(self) -> Result<NormalSweet, BuildError> {
        Ok(NormalSweet {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
