pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct VibrantExcitement {
    #[serde(default)]
    pub value: String,
}

impl VibrantExcitement {
    pub fn builder() -> VibrantExcitementBuilder {
        VibrantExcitementBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct VibrantExcitementBuilder {
    value: Option<String>,
}

impl VibrantExcitementBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`VibrantExcitement`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](VibrantExcitementBuilder::value)
    pub fn build(self) -> Result<VibrantExcitement, BuildError> {
        Ok(VibrantExcitement {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
