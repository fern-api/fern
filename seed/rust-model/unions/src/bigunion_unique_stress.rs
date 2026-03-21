pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UniqueStress {
    #[serde(default)]
    pub value: String,
}

impl UniqueStress {
    pub fn builder() -> UniqueStressBuilder {
        UniqueStressBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UniqueStressBuilder {
    value: Option<String>,
}

impl UniqueStressBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UniqueStress`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](UniqueStressBuilder::value)
    pub fn build(self) -> Result<UniqueStress, BuildError> {
        Ok(UniqueStress {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
