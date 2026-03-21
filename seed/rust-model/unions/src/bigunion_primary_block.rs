pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PrimaryBlock {
    #[serde(default)]
    pub value: String,
}

impl PrimaryBlock {
    pub fn builder() -> PrimaryBlockBuilder {
        PrimaryBlockBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PrimaryBlockBuilder {
    value: Option<String>,
}

impl PrimaryBlockBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PrimaryBlock`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](PrimaryBlockBuilder::value)
    pub fn build(self) -> Result<PrimaryBlock, BuildError> {
        Ok(PrimaryBlock {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
