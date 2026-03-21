pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PotableBad {
    #[serde(default)]
    pub value: String,
}

impl PotableBad {
    pub fn builder() -> PotableBadBuilder {
        PotableBadBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PotableBadBuilder {
    value: Option<String>,
}

impl PotableBadBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PotableBad`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](PotableBadBuilder::value)
    pub fn build(self) -> Result<PotableBad, BuildError> {
        Ok(PotableBad {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
